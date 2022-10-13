import { Game, InfoSource, Notification, User } from '@game-watch/database';
import { Logger } from '@game-watch/service';
import {
    GameData,
    GameDataU,
    InfoSourceType,
    NotificationData,
    NotificationType,
} from '@game-watch/shared';
import { EntityManager } from '@mikro-orm/core';

import { MailService } from './mail-service';

export interface NotificationCreatorContext<T extends InfoSourceType = InfoSourceType> {
    game: Game
    infoSource: InfoSource
    existingGameData: GameData[T] | null
    resolvedGameData: GameData[T]
    em: EntityManager
    logger: Logger
}

export interface NotificationCreator<T extends NotificationType> {
    forNotificationType: NotificationType;
    supportsInfoSourceTypes: InfoSourceType[];
    createNotification: (
        context: NotificationCreatorContext
    ) => Promise<NotificationData[T] | null>;
}

export class NotificationService {
    public constructor(
        private readonly notificationCreators: NotificationCreator<NotificationType>[],
        private readonly mailService: MailService,
        private readonly em: EntityManager,
        private readonly sourceScopedLogger: Logger
    ) { }

    public async createNotifications(
        { sourceId, existingGameData, resolvedGameData }: {
            sourceId: string
            existingGameData: GameDataU | null
            resolvedGameData: GameDataU | null
        }
    ) {
        const infoSource = await this.em.findOneOrFail<InfoSource, 'game' | 'user'>(
            InfoSource,
            sourceId,
            { populate: ['game', 'user'] }
        );
        const game = infoSource.game.getEntity();
        const user = infoSource.user.getEntity();

        const logger = this.sourceScopedLogger.child({ gameId: game.id, userId: user.id });

        if (resolvedGameData === null) {
            return await this.createResolveErrorNotification({
                game,
                infoSource,
                user,
                logger
            });
        }

        const relevantNotificationCreators = this.notificationCreators.filter(
            ({ supportsInfoSourceTypes }) => supportsInfoSourceTypes.includes(infoSource.type)
        );

        logger.info(
            `Checking for ${JSON.stringify(relevantNotificationCreators.map(creator => creator.forNotificationType))}`
        );

        await Promise.all(
            relevantNotificationCreators.map(async creator => await this.createNotification({
                creator,
                game,
                infoSource,
                user,
                existingGameData,
                resolvedGameData,
                logger
            }))
        );
    }

    private async createResolveErrorNotification({ game, infoSource, user, logger }: {
        game: Game
        infoSource: InfoSource
        user: User
        logger: Logger
    }) {
        const existingNotification = await this.em.findOne(Notification, {
            infoSource,
            type: NotificationType.ResolveError
        });
        if (existingNotification) {
            logger.debug('Not adding notification because there is already another ResolveError notification for that game');
            return;
        }

        return await this.persistNotification({
            notification: new Notification<NotificationType>({
                game,
                infoSource,
                type: NotificationType.ResolveError,
                data: {}
            }),
            user,
            logger
        });
    }

    private async createNotification({
        creator,
        game,
        infoSource,
        user,
        existingGameData,
        resolvedGameData,
        logger,
    }: {
        creator: NotificationCreator<NotificationType>,
        game: Game
        infoSource: InfoSource
        user: User
        existingGameData: GameDataU | null
        resolvedGameData: GameDataU
        logger: Logger
    }) {
        const notificationData = await creator.createNotification({
            logger: logger.child({
                notificationType: creator.forNotificationType,
            }),
            game,
            infoSource,
            em: this.em,
            existingGameData,
            resolvedGameData
        });

        if (!notificationData) {
            return;
        }

        await this.persistNotification({
            notification: new Notification({
                game,
                infoSource,
                type: creator.forNotificationType,
                data: notificationData,
            }),
            user,
            logger
        });
    }

    private async persistNotification(
        { notification, user, logger }: { notification: Notification, user: User, logger: Logger }
    ) {
        logger.info(`Creating Notification of type '${notification.type}'`);

        await this.em.transactional(async transactionEm => {
            await transactionEm.nativeInsert(notification);

            if (user.enableEmailNotifications && user.emailConfirmed) {
                logger.info(`Sending notifications to ${user.email}`);

                await this.mailService.sendNotificationMail(user, notification);
            }
        });
    }
}
