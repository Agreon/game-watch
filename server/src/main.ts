import { Game } from '@game-watch/database';
import { QueueType } from '@game-watch/queue';
import { MikroORM } from '@mikro-orm/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import compression from 'compression';
import * as dotenv from "dotenv";
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
    cors: {
      allowedHeaders: "*",
      methods: "*",
      origin: corsOrigin
    }
  });
  // TODO: Use pino
  // const logger = app.get(Logger);

  const orm = app.get<MikroORM>(MikroORM);
  const migrator = orm.getMigrator();
  await migrator.up();

  app.use(compression());

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(serverPort as string);

  // logger.log(`Listening on ${serverPort}`);
  console.log(`Listening on ${serverPort}`);

  const queueService = app.get(QueueService);
  // TODO: Error wrapper?
  await queueService.registerJobHandler(QueueType.DeleteUnfinishedGameAdds, async ({ data: { gameId } }) => {
    // const gameScopedLogger = logger.child({ gameId });
    const em = orm.em.fork();
    const gameToDelete = await em.findOneOrFail(Game, gameId);
    if (gameToDelete.setupCompleted) {
      return;
    }

    console.log(`Deleting unfinished game '${gameId}'`);
    await em.nativeDelete(Game, gameId);
  });


}
bootstrap();
