import { mikroOrmConfig } from '@game-watch/database';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MiddlewareConsumer, Module } from '@nestjs/common';

import { GameModule } from './game/game-module';
import { InfoSourceModule } from './info-source/info-source-module';
import { LoggerMiddleware } from './LoggerMiddleware';
import { TagModule } from './tag/tag-module';

@Module({
  imports: [
    MikroOrmModule.forRoot(mikroOrmConfig),
    GameModule,
    InfoSourceModule,
    TagModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
