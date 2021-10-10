import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import * as dotenv from "dotenv";
import { AppModule } from './app.module';
import path from 'path';
import { MikroORM } from '@mikro-orm/core';

dotenv.config({ path: path.join(__dirname, "..", "..", '.env') });

const serverPort = process.env.SERVER_PORT;
const sentryDsn = process.env.SENTRY_DSN;
const corsOrigin = process.env.CORS_ORIGIN || true;

if (!serverPort || !sentryDsn) {
  throw new Error("Environment is not complete");
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
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

  app.useGlobalPipes(new ValidationPipe())

  await app.listen(serverPort as string);

  console.log("Listening on", serverPort);
}
bootstrap();
