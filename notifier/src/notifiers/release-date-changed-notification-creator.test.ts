import { StoreInfoSource } from '@game-watch/shared';
import dayjs from 'dayjs';

import { DEFAULT_BASE_GAME_DATA, DEFAULT_STEAM_DATA, TEST_LOGGER } from '../defaults.testutil';
import { NotificationCreatorContext } from '../notification-service';
import { ReleaseDateChangedNotificationCreator } from './release-date-changed-notification-creator';

describe('ReleaseDateChangedNotificationCreator', () => {
    const creator = new ReleaseDateChangedNotificationCreator();

    it('creates a notification if the date did not exist before', async () => {
        const newReleaseDate = dayjs().add(1, 'day').toDate();

        const result = await creator.createNotification({
            existingGameData: {
                ...DEFAULT_STEAM_DATA,
                releaseDate: undefined,
            },
            resolvedGameData: {
                ...DEFAULT_STEAM_DATA,
                releaseDate: { date: newReleaseDate, isExact: true },
            },
            logger: TEST_LOGGER,
        } as NotificationCreatorContext<StoreInfoSource>);

        expect(result).toStrictEqual({ date: newReleaseDate, isExact: true });
    });

    it("won't create a notification if no resolved data was available before", async () => {
        const newReleaseDate = dayjs().add(1, 'day').toDate();

        const result = await creator.createNotification({
            existingGameData: DEFAULT_BASE_GAME_DATA,
            resolvedGameData: {
                ...DEFAULT_STEAM_DATA,
                releaseDate: { date: newReleaseDate, isExact: true },
            },
            logger: TEST_LOGGER,
        } as NotificationCreatorContext<StoreInfoSource>);

        expect(result).toStrictEqual(null);
    });

    it("won't create a notification if no new release information is available", async () => {
        const result = await creator.createNotification({
            existingGameData: DEFAULT_STEAM_DATA,
            resolvedGameData: {
                ...DEFAULT_STEAM_DATA,
                releaseDate: undefined,
            },
            logger: TEST_LOGGER,
        } as NotificationCreatorContext<StoreInfoSource>);

        expect(result).toStrictEqual(null);
    });

    it("won't create a notification if the release date didn't change", async () => {
        const releaseDate = dayjs().add(1, 'day').toDate();

        const result = await creator.createNotification({
            existingGameData: {
                ...DEFAULT_STEAM_DATA,
                releaseDate: { date: releaseDate, isExact: true },
            },
            resolvedGameData: {
                ...DEFAULT_STEAM_DATA,
                releaseDate: { date: releaseDate, isExact: true },
            },
            logger: TEST_LOGGER,
        } as NotificationCreatorContext<StoreInfoSource>);

        expect(result).toStrictEqual(null);
    });

    it("won't create a notification if the new date is before the current date", async () => {
        const newReleaseDate = dayjs().toDate();

        const result = await creator.createNotification({
            existingGameData: {
                ...DEFAULT_STEAM_DATA,
                releaseDate: { date: dayjs().toDate(), isExact: true },
            },
            resolvedGameData: {
                ...DEFAULT_STEAM_DATA,
                releaseDate: { date: newReleaseDate, isExact: true },
            },
            logger: TEST_LOGGER,
        } as NotificationCreatorContext<StoreInfoSource>);

        expect(result).toStrictEqual(null);
    });

});
