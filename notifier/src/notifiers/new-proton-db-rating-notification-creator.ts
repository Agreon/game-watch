import { InfoSourceType, NotificationType } from '@game-watch/shared';

import { NotificationCreator, NotificationCreatorContext } from '../notification-service';

export class NewProtonDbRatingNotificationCreator
    implements NotificationCreator<NotificationType.NewProtonDbRating>
{
    public readonly forNotificationType = NotificationType.NewProtonDbRating;
    public readonly supportsInfoSourceTypes: InfoSourceType[] = [InfoSourceType.Proton];

    public async createNotification(
        {
            existingGameData,
            resolvedGameData: { score },
            logger,
        }: NotificationCreatorContext<InfoSourceType.Proton>
    ) {
        const hasExistingScore = !!existingGameData?.score;
        if (hasExistingScore) {
            logger.debug({ context: { hasExistingScore } }, 'Not adding notification because');
            return null;
        }

        logger.debug({ context: { hasExistingScore } }, 'Adding notification because');

        return { score };
    }
}
