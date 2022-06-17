import { Game, InfoSource, Notification } from "@game-watch/database";
import { Logger, parseEnvironment } from "@game-watch/service";
import {
    formatReleaseDate,
    GameData,
    InfoSourceType,
    MetacriticData,
    NotificationData,
    NotificationType,
    StoreGameData,
    StoreNotifications,
} from "@game-watch/shared";
import { EntityManager } from "@mikro-orm/core";
import sgMail from '@sendgrid/mail';
import dayjs from "dayjs";

import { EnvironmentStructure } from "./environment";

const {
    SENDGRID_API_KEY,
} = parseEnvironment(EnvironmentStructure, process.env);

sgMail.setApiKey(SENDGRID_API_KEY);


export interface NotificationCreateParams<T extends InfoSourceType = InfoSourceType> {
    game: Game
    infoSource: InfoSource<T>
    existingGameData: GameData[T]
    resolvedGameData: GameData[T]
    em: EntityManager
    logger: Logger
}

export const createNewStoreEntryNotification = async (
    { infoSource, resolvedGameData, game, logger }: NotificationCreateParams
): Promise<Notification | null> => {
    const hasExistingData = !!infoSource.data;
    if (hasExistingData) {
        logger.debug({ context: { hasExistingData } }, "Not adding notification because");
        return null;
    }

    logger.debug({ context: { hasExistingData } }, "Adding notification because");

    return new Notification({
        game,
        infoSource: infoSource,
        type: NotificationType.NewStoreEntry,
        data: resolvedGameData
    });
};

export const createReleaseDateChangedNotification = async (
    { infoSource, resolvedGameData, game, logger }: NotificationCreateParams
): Promise<Notification | null> => {
    const existingData = infoSource.data as StoreGameData | null;
    const storeData = resolvedGameData as StoreGameData;

    // We don't want duplicate notifications if a game was just added to a store.
    if (!existingData?.releaseDate) {
        logger.debug("Not adding notification because no existing data was found");
        return null;
    }

    if (!storeData.releaseDate || !storeData.originalReleaseDate) {
        logger.debug("Not adding notification because no release date was found");
        return null;
    }

    const neverHadAReleaseDate = !existingData.releaseDate;
    const releaseDateChanged = !neverHadAReleaseDate && !dayjs(existingData.releaseDate).isSame(storeData.releaseDate, "day");

    if (!neverHadAReleaseDate && !releaseDateChanged) {
        logger.debug({ context: { neverHadAReleaseDate, releaseDateChanged } }, "Not adding notification because");
        return null;
    }

    if (dayjs(storeData.releaseDate).isBefore(new Date())) {
        logger.debug("Not adding notification because added release date is today or in the past");
        return null;
    }

    logger.debug({ context: { neverHadAReleaseDate, releaseDateChanged } }, "Adding notification because");
    return new Notification({
        game,
        infoSource,
        type: NotificationType.ReleaseDateChanged,
        data: { releaseDate: storeData.releaseDate, originalDate: storeData.originalReleaseDate }
    });
};

export const createGameReleasedNotification = async (
    { infoSource, resolvedGameData, game, em, logger }: NotificationCreateParams
): Promise<Notification | null> => {
    const storeData = resolvedGameData as StoreGameData;
    const hasExistingData = !!infoSource.data;

    // We don't want duplicate notifications if a game was just added to a store.
    if (!hasExistingData) {
        logger.debug("Not adding notification because no existing data was found");
        return null;
    }

    if (!storeData.releaseDate) {
        logger.debug("Not adding notification because no new release data was found");
        return null;
    }

    if (dayjs(game.createdAt).isAfter(storeData.releaseDate)) {
        logger.debug(
            { context: { gameCreatedAt: game.createdAt, releaseDate: storeData.releaseDate } },
            "Not adding notification because the game entity was created after it's release date"
        );
        return null;
    }

    if (dayjs(infoSource.foundAt).isAfter(storeData.releaseDate)) {
        logger.debug(
            { context: { sourceFoundAt: infoSource.foundAt, releaseDate: storeData.releaseDate } },
            "Not adding notification because the source was found after it's release date"
        );
        return null;
    }

    if (dayjs(storeData.releaseDate).isAfter(dayjs())) {
        logger.debug(
            { context: { releaseDate: storeData.releaseDate } },
            "Not adding notification because game is not released yet"
        );
        return null;
    }

    const existingNotification = await em.findOne(Notification, {
        game,
        infoSource,
        type: NotificationType.GameReleased
    });
    if (existingNotification) {
        logger.debug("Not adding notification because there is already another GameReleased notification for that game");
        return null;
    }

    logger.debug(
        { context: { gameCreatedAt: game.createdAt, releaseDate: storeData.releaseDate, existingNotification } },
        "Adding notification because"
    );

    return new Notification({
        game,
        infoSource,
        type: NotificationType.GameReleased,
        data: {}
    });
};

export const createGameReducedNotification = async (
    { infoSource, resolvedGameData, game, logger }: NotificationCreateParams
): Promise<Notification | null> => {
    const existingData = infoSource.data as StoreGameData | null;
    const storeData = resolvedGameData as StoreGameData;

    if (!existingData?.priceInformation) {
        logger.debug("Not adding notification because no existing price information was found");
        return null;
    }

    if (!storeData.priceInformation) {
        logger.debug("Not adding notification because no new price information was found");
        return null;
    }

    if (storeData.priceInformation.final >= existingData.priceInformation.final) {
        logger.debug(
            { context: { existingFinalPrice: existingData.priceInformation.final, newFinalPrice: storeData.priceInformation.final } },
            "Not adding notification because the price was the same or increased");
        return null;
    }

    logger.debug(
        { context: { existingFinalPrice: existingData.priceInformation.final, newFinalPrice: storeData.priceInformation.final } },
        "Adding new notification because the price was reduced"
    );
    return new Notification({
        game,
        infoSource: infoSource,
        type: NotificationType.GameReduced,
        data: {
            initial: existingData.priceInformation.final,
            final: storeData.priceInformation.final
        },
    });
};

export const createNewMetacriticRatingNotification = async (
    { infoSource, resolvedGameData, game, logger }: NotificationCreateParams
): Promise<Notification | null> => {
    const hasExistingData = !!infoSource.data;
    if (hasExistingData) {
        logger.debug({ context: { hasExistingData } }, "Not adding notification because");
        return null;
    }

    logger.debug({ context: { hasExistingData } }, "Adding notification because");

    return new Notification({
        game,
        infoSource,
        type: NotificationType.NewMetacriticRating,
        data: {
            criticScore: (resolvedGameData as MetacriticData).criticScore,
            userScore: (resolvedGameData as MetacriticData).userScore,
        }
    });
};

const RelevantNotificationsMap: Record<InfoSourceType, NotificationType[]> = {
    [InfoSourceType.Steam]: StoreNotifications,
    [InfoSourceType.Switch]: StoreNotifications,
    [InfoSourceType.PsStore]: StoreNotifications,
    [InfoSourceType.Epic]: StoreNotifications,
    [InfoSourceType.Metacritic]: [NotificationType.NewMetacriticRating]
};


const NotificationCreationMethodsMap: Record<NotificationType, (params: NotificationCreateParams) => Promise<Notification | null>> = {
    [NotificationType.NewStoreEntry]: createNewStoreEntryNotification,
    [NotificationType.ReleaseDateChanged]: createReleaseDateChangedNotification,
    [NotificationType.GameReleased]: createGameReleasedNotification,
    [NotificationType.GameReduced]: createGameReducedNotification,
    [NotificationType.NewMetacriticRating]: createNewMetacriticRatingNotification,
};

export interface CreateNotificationsParams<T extends InfoSourceType = InfoSourceType> {
    sourceId: string
    existingGameData: GameData[T]
    resolvedGameData: GameData[T]
    em: EntityManager
    logger: Logger
}

const getNotificationSubject = (notification: Notification) => {
    const game = notification.game.getEntity();

    const gameName = game.name || game.search;

    switch (notification.type) {
        case NotificationType.GameReduced:
            return `${gameName} was reduced`;
        case NotificationType.ReleaseDateChanged:
            return `The release date of ${gameName} changed`;
        case NotificationType.NewStoreEntry:
            return `${gameName} was added to the store`;
        case NotificationType.GameReleased:
            return `${gameName} will be available today`;
        case NotificationType.NewMetacriticRating:
            return `${gameName} received a rating`;
    }
};

// TODO: We need a link to the store-page + a link to game-watch + unsubscribe
const getNotificationText = (notification: Notification) => {
    const game = notification.game.getEntity();

    const gameName = game.name || game.search;

    switch (notification.type) {
        case NotificationType.GameReduced:
            const { final, initial } = notification.data as NotificationData[NotificationType.GameReduced];
            // TODO: Localized currency
            return `${gameName} was reduced from ${initial}€ to ${final}€`;
        case NotificationType.ReleaseDateChanged:
            const formattedDate = formatReleaseDate(notification.data as NotificationData[NotificationType.ReleaseDateChanged]);
            return `${gameName} will be released on ${formattedDate}`;
        case NotificationType.NewStoreEntry:
            return `${gameName} was added to the store`;
        case NotificationType.GameReleased:
            return `${gameName} will be available today`;
        case NotificationType.NewMetacriticRating:
            return `${gameName} received a rating`;
    }
};

export const createNotifications = async (
    { sourceId, em, logger, existingGameData, resolvedGameData }: CreateNotificationsParams
) => {
    const infoSource = await em.findOneOrFail<InfoSource<InfoSourceType>, "game" | "user">(
        InfoSource,
        sourceId,
        { populate: ["game", "user"] }
    );
    const game = await infoSource.game.load();
    const user = await infoSource.user.load();

    const scopedLogger = logger.child({ gameId: game.id, userId: user.id });

    // TODO: Move to service?
    const notificationsToCreate = await Promise.all(RelevantNotificationsMap[infoSource.type].map(
        async notificationType => await NotificationCreationMethodsMap[notificationType]({
            logger: scopedLogger.child({ notificationType }),
            infoSource,
            em,
            game,
            existingGameData,
            resolvedGameData
        })
    ));

    await Promise.all(
        notificationsToCreate.map(async (notification) => {
            if (!notification) {
                return;
            }

            if (user.enableEmailNotifications && user.email) {
                // TODO: Extract
                const msg = {
                    to: user.email,
                    from: 'daniel@game-watch.agreon.de',
                    subject: getNotificationSubject(notification),
                    text: getNotificationText(notification),
                };
                await sgMail.send(msg);
            }


            await em.nativeInsert(notification);
        })
    );


};
