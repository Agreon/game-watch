import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { GameModule } from './game/game-module';
import { SearchModule } from './search/search-module';
import config from './mikro-orm.config';

@Module({
  imports: [
    GameModule,
    SearchModule,
    MikroOrmModule.forRoot(config)
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
