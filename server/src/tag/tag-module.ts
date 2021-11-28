import { Game, Tag } from '@game-watch/database';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { TagController } from './tag-controller';
import { TagService } from './tag-service';

@Module({
  imports: [
    MikroOrmModule.forFeature([Game, Tag])
  ],
  controllers: [TagController],
  providers: [TagService]
})
export class TagModule { }
