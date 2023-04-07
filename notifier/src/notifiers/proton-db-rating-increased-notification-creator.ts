import { InfoSourceType, NotificationType, ProtonDbScore, } from '@game-watch/shared';

import { NotificationCreator, NotificationCreatorContext } from '../notification-service';

const ProtonScoreRank: Record<ProtonDbScore, number> = {
    borked: 0,
    bronze: 1,
    silver: 2,
    gold: 3,
    platinum: 4,
    native: 5
};

export class ProtonDbRatingIncreasedNotificationCreator
    implements NotificationCreator<NotificationType.ProtonDbRatingIncreased>
{
    public readonly forNotificationType = NotificationType.ProtonDbRatingIncreased;
    public readonly supportsInfoSourceTypes: InfoSourceType[] = [InfoSourceType.Proton];

    public async createNotification(
        {
            existingGameData,
            resolvedGameData,
            logger,
        }: NotificationCreatorContext<InfoSourceType.Proton>
    ) {
        const hasExistingScore = !!existingGameData?.score;
        if (!hasExistingScore) {
            logger.debug({ context: { hasExistingScore } }, 'Not adding notification because');
            return null;
        }

        const oldRank = ProtonScoreRank[existingGameData.score];
        const newRank = ProtonScoreRank[resolvedGameData.score];

        if (oldRank == newRank) {
            logger.debug({ context: { oldRank, newRank } }, 'Not adding notification because it did not change');
            return null;
        }

        if (oldRank > newRank) {
            logger.debug({ context: { oldRank, newRank } }, 'Not adding notification because it decreased');
            return null;
        }

        logger.debug({ context: { hasExistingScore } }, 'Adding notification because');

        return { score: resolvedGameData.score };
    }
}
