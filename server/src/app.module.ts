import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { GameModule } from './game/game-module';
import { InfoSourceModule } from './info-source/info-source-module';
import config from './mikro-orm.config';

@Module({
  imports: [
    MikroOrmModule.forRoot(config),
    GameModule,
    InfoSourceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
