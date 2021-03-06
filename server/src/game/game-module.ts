import { Game, InfoSource, Notification, Tag, User } from '@game-watch/database';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { QueueModule } from '../queue/queue-module';
import { GameController } from './game-controller';
import { GameService } from './game-service';

@Module({
    imports: [
        MikroOrmModule.forFeature([Game, InfoSource, Tag, Notification, User]),
        QueueModule
    ],
    providers: [
        GameService
    ],
    controllers: [
        GameController
    ],
    exports: [GameService]
})
export class GameModule { }
