import { Game, InfoSource, Notification } from "@game-watch/database";
import { Logger } from "@game-watch/service";
import { GameData, InfoSourceType, MetacriticData, NotificationType, StoreGameData, StoreNotifications } from "@game-watch/shared";
import { EntityManager } from "@mikro-orm/core";

export const RelevantNotificationsMap: Record<InfoSourceType, NotificationType[]> = {
    [InfoSourceType.Steam]: StoreNotifications,
    [InfoSourceType.Switch]: StoreNotifications,
    [InfoSourceType.PsStore]: StoreNotifications,
    [InfoSourceType.Epic]: StoreNotifications,
    [InfoSourceType.Metacritic]: [NotificationType.NewMetacriticRating]
};

export interface NotificationCreateParams<T extends InfoSourceType = InfoSourceType> {
    game: Game,
    infoSource: InfoSource<T>,
    resolvedGameData: GameData[T],
    em: EntityManager,
}

// TODO: I want correct types here
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

    // TODO: this field shouldnt be nullable
    if ((!existingData?.releaseDate || existingData.releaseDate === "TBD") &&
        (storeData.releaseDate && storeData.releaseDate !== "TBD")
    ) {
        await em.nativeInsert(new Notification({
            game,
            infoSource,
            type: NotificationType.ReleaseDateChanged,
            data: { releaseDate: storeData.releaseDate }
        }));
    }
};

// TODO
export const createGameReleasedNotification = async (
    { infoSource, resolvedGameData, game, em }: NotificationCreateParams
) => {

};


export const createGameReducedNotification = async (
    { infoSource, resolvedGameData, game, em }: NotificationCreateParams
) => {
    const existingData = infoSource.data as StoreGameData | null;
    const storeData = resolvedGameData as StoreGameData;

    if (storeData.priceInformation && existingData?.priceInformation?.final !== storeData.priceInformation.final) {
        await em.nativeInsert(new Notification({
            game,
            infoSource: infoSource,
            type: NotificationType.GameReduced,
            data: storeData.priceInformation,
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

const methodMap: Record<NotificationType, (params: NotificationCreateParams) => Promise<void>> = {
    [NotificationType.NewStoreEntry]: createNewStoreEntryNotification,
    [NotificationType.ReleaseDateChanged]: createReleaseDateChangedNotification,
    [NotificationType.GameReleased]: createGameReleasedNotification,
    [NotificationType.GameReduced]: createGameReducedNotification,
    [NotificationType.NewMetacriticRating]: createNewMetacriticRatingNotification,
};


// TODO: Move into service?
// TODO: Skip on initial sync => Pass-through flag
export const createNotifications = async (
    { infoSource, ...params }: NotificationCreateParams
) => {
    for (const notificationType of RelevantNotificationsMap[infoSource.type]) {
        await methodMap[notificationType]({
            infoSource,
            ...params
        });
    }
};