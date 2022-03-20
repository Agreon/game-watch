import { Game, InfoSource, Notification } from "@game-watch/database";
import { Logger } from "@game-watch/service";
import { GameData, InfoSourceType, MetacriticData, NotificationType, StoreGameData, StoreNotifications } from "@game-watch/shared";
import { EntityManager } from "@mikro-orm/core";
import dayjs from "dayjs";

export interface NotificationCreateParams<T extends InfoSourceType = InfoSourceType> {
    game: Game
    infoSource: InfoSource<T>
    resolvedGameData: GameData[T]
    em: EntityManager
    logger: Logger
}

export const createNewStoreEntryNotification = async (
    { infoSource, resolvedGameData, game, em, logger }: NotificationCreateParams
) => {
    const hasExistingData = !!infoSource.data;
    if (hasExistingData) {
        logger.debug({ context: { hasExistingData } }, "Not adding notification because");
        return;
    }

    logger.debug({ context: { hasExistingData } }, "Adding notification because");
    await em.nativeInsert(new Notification({
        game,
        infoSource: infoSource,
        type: NotificationType.NewStoreEntry,
        data: resolvedGameData
    }));
};

// TODO: Unnecessary triggered
export const createReleaseDateChangedNotification = async (
    { infoSource, resolvedGameData, game, em, logger }: NotificationCreateParams
) => {
    const existingData = infoSource.data as StoreGameData | null;
    const storeData = resolvedGameData as StoreGameData;

    // We don't want duplicate notifications if a game was just added to a store.
    if (!existingData) {
        logger.debug("Not adding notification because no existing data was found");
        return;
    }

    if (!storeData.releaseDate) {
        logger.debug("Not adding notification because no release date was found");
        return;
    }

    const neverHadAReleaseDate = !existingData.releaseDate;
    const releaseDateChanged = !!existingData.releaseDate && !dayjs(existingData.releaseDate).isSame(storeData.releaseDate, "day");

    if (!neverHadAReleaseDate && !releaseDateChanged) {
        logger.debug({ context: { neverHadAReleaseDate, releaseDateChanged } }, "Not adding notification because");
        return;
    }

    logger.debug({ context: { neverHadAReleaseDate, releaseDateChanged } }, "Adding notification because");
    await em.nativeInsert(new Notification({
        game,
        infoSource,
        type: NotificationType.ReleaseDateChanged,
        data: { releaseDate: storeData.releaseDate }
    }));
};

export const createGameReleasedNotification = async (
    { infoSource, resolvedGameData, game, em, logger }: NotificationCreateParams
) => {
    const storeData = resolvedGameData as StoreGameData;
    const hasExistingData = !!infoSource.data;

    // We don't want duplicate notifications if a game was just added to a store.
    if (!hasExistingData) {
        logger.debug("Not adding notification because no existing data was found");
        return;
    }

    if (!storeData.releaseDate) {
        logger.debug("Not adding notification because no new release data was found");
        return;
    }

    if (dayjs(game.createdAt).isAfter(storeData.releaseDate)) {
        logger.debug(
            { context: { gameCreatedAt: game.createdAt, releaseDate: storeData.releaseDate } },
            "Not adding notification because the game entity was created after it's release date"
        );
        return;
    }

    if (dayjs(storeData.releaseDate).isAfter(dayjs())) {
        logger.debug(
            { context: { releaseDate: storeData.releaseDate } },
            "Not adding notification because game is not released yet"
        );
        return;
    }

    const existingNotification = await em.findOne(Notification, {
        game,
        infoSource,
        type: NotificationType.GameReleased
    });
    if (existingNotification) {
        logger.debug("Not adding notification because there is already another GameReleased notification for that game");
        return;
    }

    logger.debug(
        { context: { gameCreatedAt: game.createdAt, releaseDate: storeData.releaseDate, existingNotification } },
        "Adding notification because"
    );
    await em.nativeInsert(new Notification({
        game,
        infoSource,
        type: NotificationType.GameReleased,
        data: {}
    }));
};

export const createGameReducedNotification = async (
    { infoSource, resolvedGameData, game, em, logger }: NotificationCreateParams
) => {
    const existingData = infoSource.data as StoreGameData | null;
    const storeData = resolvedGameData as StoreGameData;

    if (!existingData?.priceInformation) {
        logger.debug("Not adding notification because no existing price information was found");
        return;
    }

    if (!storeData.priceInformation) {
        logger.debug("Not adding notification because no new price information was found");
        return;
    }

    if (existingData.priceInformation.final >= storeData.priceInformation.final) {
        logger.debug("Not adding notification because the price was the same or increased");
        return;
    }

    logger.debug(
        { context: { existingFinalPrice: existingData.priceInformation.final, newFinalPrice: storeData.priceInformation.final } },
        "Adding new notification because the price was reduced"
    );
    await em.nativeInsert(new Notification({
        game,
        infoSource: infoSource,
        type: NotificationType.GameReduced,
        data: {
            initial: existingData.priceInformation.final,
            final: storeData.priceInformation.final
        },
    }));
};

export const createNewMetacriticRatingNotification = async (
    { infoSource, resolvedGameData, game, em, logger }: NotificationCreateParams
) => {
    const hasExistingData = !!infoSource.data;
    if (hasExistingData) {
        logger.debug({ context: { hasExistingData } }, "Not adding notification because");
        return;
    }

    logger.debug({ context: { hasExistingData } }, "Adding notification because");
    await em.nativeInsert(new Notification({
        game,
        infoSource,
        type: NotificationType.NewMetacriticRating,
        data: {
            criticScore: (resolvedGameData as MetacriticData).criticScore,
            userScore: (resolvedGameData as MetacriticData).userScore,
        }
    }));
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
    { infoSource, logger, ...params }: NotificationCreateParams
) => {
    await Promise.all(RelevantNotificationsMap[infoSource.type].map(
        async notificationType => await NotificationCreationMethodsMap[notificationType]({
            infoSource,
            logger: logger.child({ notificationType }),
            ...params
        })
    ));
};
