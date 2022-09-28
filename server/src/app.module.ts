import { mikroOrmConfig } from '@game-watch/database';
import { DEFAULT_JOB_OPTIONS, QUEUE_CONNECTION_OPTIONS } from '@game-watch/queue';
import { createLogger, parseEnvironment } from '@game-watch/service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import { AuthModule } from './auth/auth-module';
import { Environment as environment, EnvironmentStructure } from './environment';
import { GameModule } from './game/game-module';
import { InfoSourceModule } from './info-source/info-source-module';
import { LoggerMiddleware } from './LoggerMiddleware';
import { NotificationModule } from './notification/notification-module';
import { ProcessorModule } from './processors/processor-module';
import { TagModule } from './tag/tag-module';
import { UserModule } from './user/user-module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: () => parseEnvironment(EnvironmentStructure, process.env),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<environment, true>) => ({
        ttl: config.get('THROTTLE_TTL'),
        limit: config.get('THROTTLE_LIMIT'),
      }),
    }),
    AuthModule,
    MikroOrmModule.forRoot(mikroOrmConfig),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      providers: [],
      inject: [ConfigService],
      useFactory: (config: ConfigService<environment, true>) => ({
        pinoHttp: {
          autoLogging: !config.get('PRETTY_LOGGING'),
          quietReqLogger: config.get('PRETTY_LOGGING'),
          redact: {
            paths: [
              'req.headers.cookie',
              'req.headers.authorization',
            ],
            remove: true,
          },
          logger: createLogger('Server'),
        },
      }),
    }),
    BullModule.forRoot({
      connection: QUEUE_CONNECTION_OPTIONS,
      defaultJobOptions: DEFAULT_JOB_OPTIONS
    }),
    ProcessorModule,
    GameModule,
    InfoSourceModule,
    TagModule,
    NotificationModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
