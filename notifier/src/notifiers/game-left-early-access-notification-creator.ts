import { InfoSourceType, NotificationType, SteamGameData } from '@game-watch/shared';

import { NotificationCreator, NotificationCreatorContext } from '../notification-service';

export class GameLeftEarlyAccessNotificationCreator
    implements NotificationCreator<NotificationType.LeftEarlyAccess>
{
    public readonly forNotificationType = NotificationType.LeftEarlyAccess;
    public readonly supportsInfoSourceTypes = [InfoSourceType.Steam];

    public async createNotification({
        existingGameData,
        resolvedGameData,
        logger
    }: NotificationCreatorContext<InfoSourceType>) {
        const hasExistingData = !!existingGameData;

        // We don't want duplicate notifications if a game was just added to a store.
        if (!hasExistingData) {
            logger.debug('Not adding notification because no existing data was found');
            return null;
        }

        const existingSteamGameData = existingGameData as SteamGameData;
        if (existingSteamGameData.isEarlyAccess === false) {
            logger.debug('Not adding notification because game was not in early access before');
            return null;
        }

        const steamGameData = resolvedGameData as SteamGameData;

        if (!steamGameData.isEarlyAccess) {
            logger.debug('Not adding notification because game did not leave early access');
            return null;
        }

        return {};
    }
}
