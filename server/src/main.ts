import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

import { initializeSentry, parseEnvironment } from '@game-watch/service';
import { MikroORM } from '@mikro-orm/core';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { EnvironmentStructure } from './environment';

const {
  CORS_ORIGIN,
  SERVER_PORT,
} = parseEnvironment(EnvironmentStructure, process.env);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    bufferLogs: true,
    cors: {
      methods: 'POST, PATCH, PUT, GET, DELETE, OPTIONS',
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


  initializeSentry('Server', [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app: app.getHttpAdapter().getInstance() }),
  ]);

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
  app.use(Sentry.Handlers.errorHandler());

  await app.listen(SERVER_PORT);

  logger.log(`Listening on ${SERVER_PORT}`);
}

bootstrap();
