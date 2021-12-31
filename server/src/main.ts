import { Game } from '@game-watch/database';
import { QueueType } from '@game-watch/queue';
import { MikroORM } from '@mikro-orm/core';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import compression from 'compression';
import * as dotenv from "dotenv";
import { Logger } from "nestjs-pino";
import path from 'path';

import { AppModule } from './app.module';
import { QueueService } from './queue/queue-service';

dotenv.config({ path: path.join(__dirname, "..", "..", '.env') });

const serverPort = process.env.SERVER_PORT;
const corsOrigin = process.env.CORS_ORIGIN || true;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
  initialScope: { tags: { service: "server" } },
  tracesSampleRate: 1.0,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    bufferLogs: true,
    cors: {
      allowedHeaders: "*",
      methods: "*",
      origin: corsOrigin
    }
  });
  const logger = app.get(Logger);
  app.useLogger(logger);

  const orm = app.get<MikroORM>(MikroORM);
  const migrator = orm.getMigrator();
  await migrator.up();

  app.use(compression());

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(serverPort as string);

  logger.log(`Listening on ${serverPort}`);

  const queueService = app.get(QueueService);
  await queueService.registerJobHandler(QueueType.DeleteUnfinishedGameAdds, async ({ data: { gameId } }) => {
    const em = orm.em.fork();
    const gameToDelete = await em.findOneOrFail(Game, gameId);
    if (gameToDelete.setupCompleted) {
      return;
    }

    logger.log(`Deleting unfinished game '${gameToDelete.id}'`);
    await em.nativeDelete(Game, gameId);
  });
}
bootstrap();
