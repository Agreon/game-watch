import {
    InfoSourceType,
    NotificationType,
    StoreInfoSource,
    StoreInfoSources,
} from '@game-watch/shared';
import dayjs from 'dayjs';

import { NotificationCreator, NotificationCreatorContext } from '../notification-service';

export class ReleaseDateChangedNotificationCreator
    implements NotificationCreator<NotificationType.ReleaseDateChanged>
{
    public readonly forNotificationType = NotificationType.ReleaseDateChanged;
    public readonly supportsInfoSourceTypes: InfoSourceType[] = StoreInfoSources;

    public async createNotification(
        {
            existingGameData: { releaseDate: existingReleaseDate, thumbnailUrl: existingThumbnailUrl },
            resolvedGameData: { releaseDate: resolvedReleaseDate },
            logger
        }: NotificationCreatorContext<StoreInfoSource>
    ) {
        if (!resolvedReleaseDate) {
            logger.debug('Not adding notification because no release date was found');
            return null;
        }

        // We don't want to trigger a notification if a game was just added to a store because this
        // would result in two notifications.
        if (!existingThumbnailUrl) {
            logger.debug('Not adding notification because no existing date was found');
            return null;
        }

        if (!existingReleaseDate) {
            logger.debug(
                { context: { existingReleaseDate, resolvedReleaseDate } },
                'Adding notification because date was not available before'
            );
            return resolvedReleaseDate;
        }

        if (existingReleaseDate.isExact === undefined) {
            logger.debug('Not adding notification because we cannot compare with old data');
            return null;
        }

        if (!resolvedReleaseDate.isExact) {
            if (!existingReleaseDate.isExact) {
                if (resolvedReleaseDate.date !== existingReleaseDate.date) {
                    logger.debug(
                        { context: { existingReleaseDate, resolvedReleaseDate } },
                        'Adding notification because date did change'
                    );
                    return resolvedReleaseDate;
                }
                logger.debug(
                    { context: { existingReleaseDate, resolvedReleaseDate } },
                    'Not adding notification because date did not change'
                );
                return null;
            }

            // Unexpected, but theoretically possible
            logger.debug(
                { context: { existingReleaseDate, resolvedReleaseDate } },
                'Adding notification because date became non specific'
            );
            return resolvedReleaseDate;
        }

        if (dayjs(resolvedReleaseDate.date).isBefore(new Date())) {
            logger.debug(
                'Not adding notification because added release date is today or in the past'
            );
            return null;
        }

        if (!existingReleaseDate.isExact) {
            logger.debug(
                { context: { existingReleaseDate, resolvedReleaseDate } },
                'Adding notification because date was not exact before'
            );

            return resolvedReleaseDate;
        }

        if (dayjs(existingReleaseDate.date).isSame(resolvedReleaseDate.date, 'day')) {
            logger.debug(
                { context: { existingReleaseDate, resolvedReleaseDate } },
                'Not adding notification because date did not change'
            );
            return null;
        }

        logger.debug(
            { context: { existingReleaseDate, resolvedReleaseDate } },
            'Adding notification because date changed'
        );

        return resolvedReleaseDate;
    }
}
