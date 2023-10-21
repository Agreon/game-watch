import { InfoSourceType, NotificationType } from '@game-watch/shared';

import { NotificationCreator, NotificationCreatorContext } from '../notification-service';

export class NewMetacriticUserRatingNotificationCreator
    implements NotificationCreator<NotificationType.NewMetacriticUserRating>
{
    public readonly forNotificationType = NotificationType.NewMetacriticUserRating;
    public readonly supportsInfoSourceTypes: InfoSourceType[] = [InfoSourceType.Metacritic];

    public async createNotification(
        {
            existingGameData,
            resolvedGameData: { criticScore, userScore },
            logger,
        }: NotificationCreatorContext<InfoSourceType.Metacritic>
    ) {
        const hasExistingUserScore = existingGameData && existingGameData.userScore !== 'tbd';
        if (hasExistingUserScore) {
            logger.debug({ context: { hasExistingUserScore } }, 'Not adding notification because');
            return null;
        }

        if (userScore === 'tbd') {
            logger.debug({ context: { userScore } }, 'Not adding notification because');
            return null;
        }

        logger.debug({ context: { hasExistingUserScore, userScore } }, 'Adding notification because');

        return { criticScore, userScore };
    }
}
