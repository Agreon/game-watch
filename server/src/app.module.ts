import { mikroOrmConfig } from '@game-watch/database';
import { parseEnvironment } from '@game-watch/service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import { AuthModule } from './auth/auth-module';
import { Environment, EnvironmentStructure } from './environment';
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
      useFactory: (config: ConfigService<Environment, true>) => ({
        ttl: config.get('THROTTLE_TTL'),
        limit: config.get('THROTTLE_LIMIT'),
      }),
    }),
    AuthModule,
    MikroOrmModule.forRoot(mikroOrmConfig),
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: false,
        quietReqLogger: true,
        name: "Server",
        level: "debug",
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
            translateTime: "yyyy-mm-dd HH:MM:ss.l",
            ignore: 'pid,hostname',
          }
        },
      },
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
