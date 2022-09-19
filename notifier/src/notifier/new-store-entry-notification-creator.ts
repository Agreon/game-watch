import {
    InfoSourceType,
    NotificationType,
    StoreInfoSource,
    StoreInfoSources,
} from '@game-watch/shared';

import { NotificationCreator, NotificationCreatorContext } from '../notification-service';

export class NewStoreEntryNotificationCreator
    implements NotificationCreator<NotificationType.NewStoreEntry>
{
    public readonly forNotificationType = NotificationType.NewStoreEntry;
    public readonly supportsInfoSourceTypes: InfoSourceType[] = StoreInfoSources;

    public async createNotification(
        { existingGameData, resolvedGameData, logger }: NotificationCreatorContext<StoreInfoSource>
    ) {
        const hasExistingData = !!existingGameData;
        if (hasExistingData) {
            logger.debug({ context: { hasExistingData } }, 'Not adding notification because');
            return null;
        }

        logger.debug({ context: { hasExistingData } }, 'Adding notification because');

        return resolvedGameData;
    }
}
