import { Game } from '@game-watch/database';
import { QueueType } from '@game-watch/queue';
import { parseEnvironment } from '@game-watch/service';
import { MikroORM } from '@mikro-orm/core';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import * as dotenv from "dotenv";
import { Logger } from "nestjs-pino";
import path from 'path';

import { AppModule } from './app.module';
import { EnvironmentStructure } from './environment';
import { GameService } from './game/game-service';
import { QueueService } from './queue/queue-service';

dotenv.config({ path: path.join(__dirname, "..", "..", '.env') });

const { SENTRY_DSN, SENTRY_ENVIRONMENT, CORS_ORIGIN, SERVER_PORT } = parseEnvironment(EnvironmentStructure, process.env);

Sentry.init({
  dsn: SENTRY_DSN,
  environment: SENTRY_ENVIRONMENT,
  initialScope: { tags: { service: "server" } },
  tracesSampleRate: 1.0,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    bufferLogs: true,
    cors: {
      // allowedHeaders: "*",
      // methods: "*",
      credentials: true,
      origin: true
      // origin: CORS_ORIGIN
    }
  });
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const logger = app.get(Logger);
  app.useLogger(logger);

  const orm = app.get<MikroORM>(MikroORM);
  const migrator = orm.getMigrator();
  await migrator.up();

  app.use(cookieParser());
  app.use(compression());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(SERVER_PORT);

  logger.log(`Listening on ${SERVER_PORT}`);

  const queueService = app.get(QueueService);
  const gameService = app.get(GameService);
  await queueService.registerJobHandler(QueueType.DeleteUnfinishedGameAdds, async ({ data: { gameId } }) => {
    const em = orm.em.fork();
    const gameToDelete = await em.findOneOrFail(Game, gameId);
    if (gameToDelete.setupCompleted) {
      return;
    }

    logger.log(`Deleting unfinished game '${gameToDelete.id}'`);
    await gameService.deleteGame(gameToDelete.id);
  });
}

bootstrap();
