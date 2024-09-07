import { InfoSourceType, NotificationType } from '@game-watch/shared';

import { NotificationCreator, NotificationCreatorContext } from '../notification-service';

export class NewOpenCriticRatingNotificationCreator
    implements NotificationCreator<NotificationType.NewOpenCriticRating>
{
    public readonly forNotificationType = NotificationType.NewOpenCriticRating;
    public readonly supportsInfoSourceTypes: InfoSourceType[] = [InfoSourceType.OpenCritic];

    public async createNotification(
        {
            existingGameData,
            resolvedGameData: { criticScore, recommendedBy },
            logger,
        }: NotificationCreatorContext<InfoSourceType.OpenCritic>
    ) {
        const hasExistingScore = !!existingGameData?.criticScore;
        if (hasExistingScore) {
            logger.debug({ context: { hasExistingScore } }, 'Not adding notification because');
            return null;
        }

        logger.debug({ context: { hasExistingScore } }, 'Adding notification because');

        return { criticScore, recommendedBy };
    }
}
