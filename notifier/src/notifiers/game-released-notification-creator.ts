import { Notification } from '@game-watch/database';
import {
    InfoSourceType,
    isNonSpecificDate,
    NotificationType,
    StoreInfoSource,
    StoreInfoSources
} from '@game-watch/shared';
import dayjs from 'dayjs';

import { NotificationCreator, NotificationCreatorContext } from '../notification-service';

export class GameReleasedNotificationCreator
    implements NotificationCreator<NotificationType.GameReleased>
{
    public readonly forNotificationType = NotificationType.GameReleased;
    public readonly supportsInfoSourceTypes: InfoSourceType[] = StoreInfoSources;

    public async createNotification(
        {
            infoSource,
            existingGameData,
            resolvedGameData,
            em,
            game,
            logger,
        }: NotificationCreatorContext<StoreInfoSource>
    ) {
        const hasExistingData = !!existingGameData.thumbnailUrl;

        // We don't want duplicate notifications if a game was just added to a store.
        if (!hasExistingData) {
            logger.debug('Not adding notification because no existing data was found');
            return null;
        }

        if (!resolvedGameData.releaseDate) {
            logger.debug('Not adding notification because no new release data was found');
            return null;
        }

        if (
            resolvedGameData.originalReleaseDate
            && isNonSpecificDate(resolvedGameData.originalReleaseDate)
        ) {
            logger.debug({
                context: {
                    originalReleaseDate: resolvedGameData.originalReleaseDate
                }
            }, 'Not adding notification because original release date is not specific');
            return null;
        }

        if (dayjs(game.createdAt).isAfter(resolvedGameData.releaseDate)) {
            logger.debug(
                {
                    context: {
                        gameCreatedAt: game.createdAt,
                        releaseDate: resolvedGameData.releaseDate
                    }
                },
                "Not adding notification because the game entity was created after it's release date"
            );
            return null;
        }

        if (dayjs(infoSource.foundAt).isAfter(resolvedGameData.releaseDate)) {
            logger.debug(
                {
                    context: {
                        sourceFoundAt: infoSource.foundAt,
                        releaseDate: resolvedGameData.releaseDate
                    }
                },
                "Not adding notification because the source was found after it's release date"
            );
            return null;
        }

        if (dayjs(resolvedGameData.releaseDate).isAfter(dayjs())) {
            logger.debug(
                { context: { releaseDate: resolvedGameData.releaseDate } },
                'Not adding notification because game is not released yet'
            );
            return null;
        }

        const existingNotification = await em.findOne(Notification, {
            infoSource,
            type: NotificationType.GameReleased
        });
        if (existingNotification) {
            logger.debug('Not adding notification because there is already another GameReleased notification for that game');
            return null;
        }

        logger.debug(
            {
                context: {
                    gameCreatedAt: game.createdAt,
                    releaseDate: resolvedGameData.releaseDate,
                    existingNotification
                }
            },
            'Adding notification because'
        );

        return {};
    }
}
