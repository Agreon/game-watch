import { InfoSourceType } from '@game-watch/shared';

import { DEFAULT_BASE_GAME_DATA, DEFAULT_PROTON_DATA, TEST_LOGGER } from '../defaults.testutil';
import { NotificationCreatorContext } from '../notification-service';
import { ProtonDbRatingIncreasedNotificationCreator } from './proton-db-rating-increased-notification-creator';

describe('ProtonDbRatingIncreasedNotificationCreator', () => {
    const creator = new ProtonDbRatingIncreasedNotificationCreator();

    it('will create a notification if the score increased', async () => {
        const result = await creator.createNotification({
            existingGameData: {
                ...DEFAULT_PROTON_DATA,
                score: 'gold',
            },
            resolvedGameData: {
                ...DEFAULT_PROTON_DATA,
                score: 'platinum',
            },
            logger: TEST_LOGGER,
        } as NotificationCreatorContext<InfoSourceType.Proton>);

        expect(result).toStrictEqual({
            score: 'platinum'
        });
    });

    it("won't create a notification if the score decreased", async () => {
        const result = await creator.createNotification({
            existingGameData: {
                ...DEFAULT_PROTON_DATA,
                score: 'gold',
            },
            resolvedGameData: {
                ...DEFAULT_PROTON_DATA,
                score: 'silver',
            },
            logger: TEST_LOGGER,
        } as NotificationCreatorContext<InfoSourceType.Proton>);

        expect(result).toBe(null);
    });

    it("won't create a notification if the score stayed the same", async () => {
        const result = await creator.createNotification({
            existingGameData: {
                ...DEFAULT_PROTON_DATA,
                score: 'gold',
            },
            resolvedGameData: {
                ...DEFAULT_PROTON_DATA,
                score: 'gold',
            },
            logger: TEST_LOGGER,
        } as NotificationCreatorContext<InfoSourceType.Proton>);

        expect(result).toBe(null);
    });

    it("won't create a notification if no previous score was available", async () => {
        const result = await creator.createNotification({
            existingGameData: DEFAULT_BASE_GAME_DATA,
            resolvedGameData: {
                ...DEFAULT_PROTON_DATA,
                score: 'silver',
            },
            logger: TEST_LOGGER,
        } as NotificationCreatorContext<InfoSourceType.Proton>);

        expect(result).toBe(null);
    });

});
