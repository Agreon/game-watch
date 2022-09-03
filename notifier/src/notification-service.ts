import { Game, InfoSource, Notification, User } from "@game-watch/database";
import { Logger } from "@game-watch/service";
import { GameData, InfoSourceType, NotificationData, NotificationType } from "@game-watch/shared";
import { EntityManager } from "@mikro-orm/core";

import { MailService } from "./mail-service";

export interface CreateNotificationsParams<T extends InfoSourceType = InfoSourceType> {
    sourceId: string
    existingGameData: GameData[T] | null
    resolvedGameData: GameData[T] | null
    em: EntityManager
}

interface PersistNotificationParams {
    notification: Notification;
    logger: Logger;
    em: EntityManager;
    user: User;
}

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
    createNotification: (context: NotificationCreatorContext) => Promise<NotificationData[T] | null>;
}

export class NotificationService {
    public constructor(
        private readonly notificationCreators: NotificationCreator<NotificationType>[],
        private readonly mailService: MailService,
        private readonly logger: Logger
    ) { }

    public async createNotifications(
        { sourceId, existingGameData, resolvedGameData, em }: CreateNotificationsParams
    ) {
        const infoSource = await em.findOneOrFail<InfoSource, "game" | "user">(
            InfoSource,
            sourceId,
            { populate: ["game", "user"] }
        );
        const game = infoSource.game.getEntity();
        const user = infoSource.user.getEntity();

        const scopedLogger = this.logger.child({ sourceId, gameId: game.id, userId: user.id });

        if(resolvedGameData === null){

            const existingNotification = await em.findOne(Notification, {
                infoSource,
                type: NotificationType.ResolveError
            });
            if (existingNotification) {
                scopedLogger.debug("Not adding notification because there is already another ResolveError notification for that game");
                return;
            }

            return await this.persistNotification({
                notification: new Notification<NotificationType>({
                    game,
                    infoSource,
                    type: NotificationType.ResolveError,
                    data: {}
                }),
                em,
                user,
                logger: scopedLogger
            });
        }

        const relevantNotificationCreators = this.notificationCreators.filter(
            ({ supportsInfoSourceTypes }) => supportsInfoSourceTypes.includes(infoSource.type)
        );

        scopedLogger.info(
            `Checking for ${JSON.stringify(relevantNotificationCreators.map(creator => creator.forNotificationType))}`
        );

        await Promise.all(
            relevantNotificationCreators.map(async creator => {
                const data = await creator.createNotification({
                    logger: scopedLogger.child({
                        notificationType: creator.forNotificationType,
                    }),
                    game,
                    infoSource,
                    em,
                    existingGameData,
                    resolvedGameData
                });

                if (!data) {
                    return;
                }

                const notification = new Notification({
                    game,
                    infoSource,
                    type: creator.forNotificationType,
                    data,
                });

                await this.persistNotification({
                    notification,
                    em,
                    user,
                    logger: scopedLogger
                });
            })
        );
    }

    private async persistNotification(
        { notification, logger, em, user }: PersistNotificationParams
    ) {
        logger.info(`Creating Notification of type '${notification.type}'`);

        await em.transactional(async transactionEm => {
            await transactionEm.nativeInsert(notification);

            if (user.enableEmailNotifications) {
                logger.info(`Sending notifications to ${user.email}`);

                await this.mailService.sendNotificationMail(user, notification);
            }
        });
    }
}
