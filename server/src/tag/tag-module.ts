import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { Game } from '../game/game-model';
import { TagController } from './tag-controller';
import { Tag } from './tag-model';
import { TagService } from './tag-service';

@Module({
  imports: [
    MikroOrmModule.forFeature([Game, Tag])
  ],
  controllers: [TagController],
  providers: [TagService]
})
export class TagModule { }
