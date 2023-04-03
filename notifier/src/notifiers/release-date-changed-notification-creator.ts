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
        { existingGameData, resolvedGameData, logger }: NotificationCreatorContext<StoreInfoSource>
    ) {
        // We don't want duplicate notifications if a game was just added to a store.
        if (!existingGameData) {
            logger.debug('Not adding notification because no existing data was found');
            return null;
        }

        if (!resolvedGameData.releaseDate || !resolvedGameData.originalReleaseDate) {
            logger.debug('Not adding notification because no release date was found');
            return null;
        }

        const neverHadAReleaseDate = !existingGameData.releaseDate;
        const releaseDateChanged = (
            !neverHadAReleaseDate
            && !dayjs(existingGameData.releaseDate).isSame(resolvedGameData.releaseDate, 'day')
        );

        if (!neverHadAReleaseDate && !releaseDateChanged) {
            logger.debug(
                { context: { neverHadAReleaseDate, releaseDateChanged } },
                'Not adding notification because'
            );
            return null;
        }

        if (dayjs(resolvedGameData.releaseDate).isBefore(new Date())) {
            logger.debug(
                'Not adding notification because added release date is today or in the past'
            );
            return null;
        }

        logger.debug(
            { context: { neverHadAReleaseDate, releaseDateChanged } },
            'Adding notification because'
        );
        return {
            releaseDate: resolvedGameData.releaseDate,
            originalDate: resolvedGameData.originalReleaseDate
        };
    }
}
