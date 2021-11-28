import { MikroORM } from '@mikro-orm/core';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import compression from 'compression';
import * as dotenv from "dotenv";
import path from 'path';

import { AppModule } from './app.module';

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

  const orm = app.get<MikroORM>(MikroORM);
  const migrator = orm.getMigrator();
  await migrator.up();

  app.use(compression());

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(serverPort as string);

  console.log("Listening on", serverPort);
}
bootstrap();
