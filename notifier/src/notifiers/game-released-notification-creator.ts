import { Notification } from '@game-watch/database';
import {
    InfoSourceType,
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
            resolvedGameData: { releaseDate: resolvedReleaseDate },
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

        if (!resolvedReleaseDate) {
            logger.debug('Not adding notification because no new release data was found');
            return null;
        }

        if (!resolvedReleaseDate.isExact) {
            logger.debug(
                { context: { resolvedReleaseDate } },
                'Not adding notification because resolved release date is not specific'
            );
            return null;
        }

        if (dayjs(game.createdAt).isAfter(resolvedReleaseDate.date)) {
            logger.debug(
                {
                    context: {
                        gameCreatedAt: game.createdAt,
                        resolvedReleaseDate
                    }
                },
                "Not adding notification because the game entity was created after it's release date"
            );
            return null;
        }

        if (dayjs(infoSource.foundAt).isAfter(resolvedReleaseDate.date)) {
            logger.debug(
                {
                    context: {
                        sourceFoundAt: infoSource.foundAt,
                        resolvedReleaseDate
                    }
                },
                "Not adding notification because the source was found after it's release date"
            );
            return null;
        }

        if (dayjs(resolvedReleaseDate.date).isAfter(dayjs())) {
            logger.debug(
                { context: { resolvedReleaseDate } },
                'Not adding notification because game is not released yet'
            );
            return null;
        }

        const existingNotification = await em.findOne(Notification, {
            infoSource,
            type: NotificationType.GameReleased
        });
        if (existingNotification) {
            logger.debug(
                'Not adding notification because there is already another GameReleased notification for that game'
            );
            return null;
        }

        logger.debug(
            {
                context: {
                    gameCreatedAt: game.createdAt,
                    resolvedReleaseDate,
                    existingNotification
                }
            },
            'Adding notification because'
        );

        return {};
    }
}
