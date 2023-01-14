import { Game, InfoSource, Notification } from '@game-watch/database';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { NotificationController } from './notification-controller';
import { NotificationService } from './notification-service';

@Module({
    imports: [
        MikroOrmModule.forFeature([Game, InfoSource, Notification]),
    ],
    providers: [
        NotificationService
    ],
    controllers: [
        NotificationController
    ]
})
export class NotificationModule { }
