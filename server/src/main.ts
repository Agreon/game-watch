import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import * as dotenv from "dotenv";
import { AppModule } from './app.module';

dotenv.config();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    cors: false
  });

  await app.listen(3002);
}
bootstrap();
