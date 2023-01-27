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
        const hasExistingScore = !!existingGameData?.criticScore;
        if (hasExistingScore) {
            logger.debug({ context: { hasExistingScore } }, 'Not adding notification because');
            return null;
        }

        logger.debug({ context: { hasExistingScore } }, 'Adding notification because');

        return { criticScore, userScore };
    }
}
