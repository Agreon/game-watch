import { Notification } from "@game-watch/database";
import { EntityRepository, QueryOrder } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationService {
    public constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: EntityRepository<Notification>,
    ) { }

    public async getNotifications(): Promise<Notification[]> {
        return await this.notificationRepository.find(
            { read: false },
            ["game", "infoSource"],
            { createdAt: QueryOrder.DESC },
        );
    }

    public async markNotificationAsRead(notificationId: string): Promise<Notification> {
        const notification = await this.notificationRepository.findOneOrFail(notificationId);

        notification.read = true;
        await this.notificationRepository.persistAndFlush(notification);

        return notification;
    }
}
