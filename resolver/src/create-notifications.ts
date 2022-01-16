import { Game, InfoSource, Notification } from "@game-watch/database";
import { GameData, InfoSourceType, MetacriticData, NotificationType, StoreGameData, StoreNotifications } from "@game-watch/shared";
import { EntityManager } from "@mikro-orm/core";
import dayjs from "dayjs";


export interface NotificationCreateParams<T extends InfoSourceType = InfoSourceType> {
    game: Game,
    infoSource: InfoSource<T>,
    resolvedGameData: GameData[T],
    em: EntityManager,
}

export const createNewStoreEntryNotification = async (
    { infoSource, resolvedGameData, game, em }: NotificationCreateParams
) => {
    if (!infoSource.data) {
        await em.nativeInsert(new Notification({
            game,
            infoSource: infoSource,
            type: NotificationType.NewStoreEntry,
            data: resolvedGameData
        }));
    }
};

export const createReleaseDateChangedNotification = async (
    { infoSource, resolvedGameData, game, em }: NotificationCreateParams
) => {
    const existingData = infoSource.data as StoreGameData | null;
    const storeData = resolvedGameData as StoreGameData;

    if (!!existingData?.releaseDate && !!storeData.releaseDate && existingData.releaseDate !== storeData.releaseDate) {
        await em.nativeInsert(new Notification({
            game,
            infoSource,
            type: NotificationType.ReleaseDateChanged,
            data: { releaseDate: storeData.releaseDate }
        }));
    }
};

export const createGameReleasedNotification = async (
    { infoSource, resolvedGameData, game, em }: NotificationCreateParams
) => {
    const storeData = resolvedGameData as StoreGameData;
    if (!storeData.releaseDate || dayjs(storeData.releaseDate).isAfter(dayjs())) {
        return;
    }

    const existingNotification = await em.findOne(Notification, {
        game,
        infoSource,
        type: NotificationType.GameReleased
    });
    if (existingNotification) {
        return;
    }

    await em.nativeInsert(new Notification({
        game,
        infoSource,
        type: NotificationType.GameReleased,
        data: {}
    }));

};

export const createGameReducedNotification = async (
    { infoSource, resolvedGameData, game, em }: NotificationCreateParams
) => {
    const existingData = infoSource.data as StoreGameData | null;
    const storeData = resolvedGameData as StoreGameData;

    if (existingData?.priceInformation &&
        storeData.priceInformation &&
        existingData.priceInformation.final < storeData.priceInformation.final
    ) {
        await em.nativeInsert(new Notification({
            game,
            infoSource: infoSource,
            type: NotificationType.GameReduced,
            data: {
                initial: existingData.priceInformation.final,
                final: storeData.priceInformation.final
            },
        }));
    }
};


export const createNewMetacriticRatingNotification = async (
    { infoSource, resolvedGameData, game, em }: NotificationCreateParams
) => {
    const data = resolvedGameData as MetacriticData;

    if (!infoSource.data) {
        await em.nativeInsert(new Notification({
            game,
            infoSource,
            type: NotificationType.NewMetacriticRating,
            data: {
                criticScore: data.criticScore,
                userScore: data.userScore,
            }
        }));
    }
};

const RelevantNotificationsMap: Record<InfoSourceType, NotificationType[]> = {
    [InfoSourceType.Steam]: StoreNotifications,
    [InfoSourceType.Switch]: StoreNotifications,
    [InfoSourceType.PsStore]: StoreNotifications,
    [InfoSourceType.Epic]: StoreNotifications,
    [InfoSourceType.Metacritic]: [NotificationType.NewMetacriticRating]
};


const NotificationCreationMethodsMap: Record<NotificationType, (params: NotificationCreateParams) => Promise<void>> = {
    [NotificationType.NewStoreEntry]: createNewStoreEntryNotification,
    [NotificationType.ReleaseDateChanged]: createReleaseDateChangedNotification,
    [NotificationType.GameReleased]: createGameReleasedNotification,
    [NotificationType.GameReduced]: createGameReducedNotification,
    [NotificationType.NewMetacriticRating]: createNewMetacriticRatingNotification,
};


export const createNotifications = async (
    { infoSource, ...params }: NotificationCreateParams
) => {
    for (const notificationType of RelevantNotificationsMap[infoSource.type]) {
        await NotificationCreationMethodsMap[notificationType]({
            infoSource,
            ...params
        });
    }
};
