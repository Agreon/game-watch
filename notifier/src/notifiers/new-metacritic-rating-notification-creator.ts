import { InfoSourceType, NotificationType } from '@game-watch/shared';

import { NotificationCreator, NotificationCreatorContext } from '../notification-service';

export class NewMetacriticRatingNotificationCreator
    implements NotificationCreator<NotificationType.NewMetacriticRating>
{
    public readonly forNotificationType = NotificationType.NewMetacriticRating;
    public readonly supportsInfoSourceTypes: InfoSourceType[] = [InfoSourceType.Metacritic];

    public async createNotification(
        {
            existingGameData,
            resolvedGameData: { criticScore, userScore },
            logger,
        }: NotificationCreatorContext<InfoSourceType.Metacritic>
    ) {
        const hasExistingData = !!existingGameData;
        if (hasExistingData) {
            logger.debug({ context: { hasExistingData } }, 'Not adding notification because');
            return null;
        }

        logger.debug({ context: { hasExistingData } }, 'Adding notification because');

        return { criticScore, userScore };
    }
}
