import { Notification, User } from '@game-watch/database';
import { QueryOrder, Ref } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
    public constructor(
        private readonly entityManager: EntityManager
    ) { }

    public async getNotifications(user: Ref<User>): Promise<Notification[]> {
        return await this.entityManager.find(
            Notification,
            { read: false, user },
            {
                populate: ['game', 'infoSource'],
                orderBy: { createdAt: QueryOrder.DESC, id: QueryOrder.DESC },
            }
        );
    }

    public async markNotificationAsRead(id: string): Promise<Notification> {
        const notification = await this.entityManager.findOneOrFail(Notification, id);

        notification.read = true;
        await this.entityManager.persistAndFlush(notification);

        return notification;
    }

    public async markAllNotificationsAsRead(user: Ref<User>): Promise<void> {
        const notifications = await this.entityManager.find(Notification, { read: false, user });

        for (const notification of notifications) {
            notification.read = true;
        }
        await this.entityManager.persistAndFlush(notifications);
    }
}
