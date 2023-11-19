import { InfoSourceType, NotificationType, PlaystationGameData } from '@game-watch/shared';

import { NotificationCreator, NotificationCreatorContext } from '../notification-service';

export class GameAddedToPsPlusNotificationCreator
    implements NotificationCreator<NotificationType.AddedToPsPlus>
{
    public readonly forNotificationType = NotificationType.AddedToPsPlus;
    public readonly supportsInfoSourceTypes = [InfoSourceType.Playstation];

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

        const existingSteamGameData = existingGameData as PlaystationGameData;
        if (existingSteamGameData.freeForPsPlus) {
            logger.debug('Not adding notification because game was free for ps plus before');
            return null;
        }

        const steamGameData = resolvedGameData as PlaystationGameData;

        if (!steamGameData.freeForPsPlus) {
            logger.debug('Not adding notification because game is not free for ps plus');
            return null;
        }

        return {};
    }
}
