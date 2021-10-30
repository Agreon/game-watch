import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth-module';
import { Game } from '../game/game-model';
import { TagController } from './tag-controller';
import { Tag } from './tag-model';
import { TagService } from './tag-service';

@Module({
  imports: [
    AuthModule,
    MikroOrmModule.forFeature([Game, Tag])
  ],
  controllers: [TagController],
  providers: [TagService]
})
export class TagModule { }
