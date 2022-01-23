import { Game, Tag, User } from '@game-watch/database';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth-module';
import { TagController } from './tag-controller';
import { TagService } from './tag-service';

@Module({
  imports: [
    AuthModule,
    MikroOrmModule.forFeature([Game, Tag, User])
  ],
  controllers: [TagController],
  providers: [TagService]
})
export class TagModule { }
