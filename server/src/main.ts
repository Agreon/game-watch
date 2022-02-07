import * as dotenv from "dotenv";
import path from 'path';
dotenv.config({ path: path.join(__dirname, "..", "..", '.env') });

import { QueueType } from '@game-watch/queue';
import { MikroORM } from '@mikro-orm/core';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { Logger } from "nestjs-pino";

import { AppModule } from './app.module';
import { EnvironmentStructure } from './environment';
import { GameService } from './game/game-service';
import { parseEnvironment } from "./parse-environment";
import { QueueService } from './queue/queue-service';

const {
  SENTRY_DSN,
  SENTRY_ENVIRONMENT,
  CORS_ORIGIN,
  SERVER_PORT,
} = parseEnvironment(EnvironmentStructure, process.env);

Sentry.init({
  dsn: SENTRY_DSN,
  environment: SENTRY_ENVIRONMENT,
  initialScope: { tags: { service: "Server" } },
  tracesSampleRate: 1.0,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    bufferLogs: true,
    cors: {
      methods: "POST, PATCH, PUT, GET, DELETE, OPTIONS",
      credentials: true,
      origin: CORS_ORIGIN
    }
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
    try {
        const gameToDelete = await gameService.getGame(gameId);
        if (gameToDelete.setupCompleted) {
          return;
        }

        logger.log(`Deleting unfinished game '${gameToDelete.id}'`);
        await gameService.deleteGame(gameToDelete.id);
      } catch (error) {
        // Need to wrap this because otherwise the error is swallowed by the worker.
        logger.error(error);
        Sentry.captureException(error, { tags: { gameId } });
        throw error;
      }
  });
}

bootstrap();
