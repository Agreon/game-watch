import { mikroOrmConfig } from '@game-watch/database';
import { createLogger, parseEnvironment } from '@game-watch/service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
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
import { TagModule } from './tag/tag-module';


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
          autoLogging: !config.get("PRETTY_LOGGING"),
          quietReqLogger: config.get("PRETTY_LOGGING"),
          redact: {
            paths: [
              'req.headers.cookie',
              'req.headers.authorization',
            ],
            remove: true,
          },
          logger: createLogger("Server"),
        },
      }),
    }),
    GameModule,
    InfoSourceModule,
    TagModule,
    NotificationModule
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
