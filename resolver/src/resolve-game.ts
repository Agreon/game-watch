import { Game, InfoSource, Notification } from "@game-watch/database";
import { Logger } from "@game-watch/service";
import { GameDataU, InfoSourceType, NotificationType, StoreGameData } from "@game-watch/shared";
import { EntityManager } from "@mikro-orm/core";

import { ResolveService } from "./resolve-service";

interface Params {
    gameId: string;
    resolveService: ResolveService,
    em: EntityManager;
    logger: Logger;
}

// TODO: Move into service?
// TODO: Skip on initial sync => Pass-through flag
export const createNotifications = async (
    source: InfoSource,
    game: Game,
    resolvedGameData: GameDataU,
    em: EntityManager
) => {
    if (source.type !== InfoSourceType.Metacritic) {
        const existingData = source.data as StoreGameData;
        const storeData = resolvedGameData as StoreGameData;

        if (!existingData) {
            await em.nativeInsert(new Notification({
                game,
                infoSource: source,
                type: NotificationType.NewStoreEntry
            }));

            return;
        }

        // TODO: Should this field be nullable?
        // TODO: Check if released now => Other event
        if ((!existingData.releaseDate || existingData.releaseDate === "TBD") && (storeData.releaseDate && storeData.releaseDate !== "TBD")) {
            await em.nativeInsert(new Notification({
                game,
                infoSource: source,
                type: NotificationType.ReleaseDateChanged
            }));
        }

        // TODO: Can this be nullable?
        if (existingData.priceInformation?.final !== storeData.priceInformation?.final) {
            await em.nativeInsert(new Notification({
                game,
                infoSource: source,
                type: NotificationType.GameReduced
            }));
        }


    } else if (source.type === InfoSourceType.Metacritic) {
        if (!source.data) {
            await em.nativeInsert(new Notification({
                game,
                infoSource: source,
                type: NotificationType.NewMetacriticRating
            }));
        }
    }
};

export const resolveGame = async ({ gameId, resolveService, em, logger }: Params) => {
    const startTime = new Date().getTime();

    const game = await em.findOneOrFail(Game, gameId, ["infoSources"]);

    const sourcesToResolve = (await game.infoSources.loadItems()).filter(infoSource => !infoSource.disabled);

    logger.info(`Resolving for ${JSON.stringify(sourcesToResolve.map(({ type }) => type))}`);

    await Promise.all(sourcesToResolve.map(async source => {
        logger.info(`Resolving ${source.type}`);

        const resolvedGameData = await resolveService.resolveGameInformation(
            source.remoteGameId,
            source.type,
            { logger }
        );
        if (!resolvedGameData) {
            logger.warn(`Source ${source.type} could not be resolved`);

            await em.nativeUpdate(InfoSource, source.id, {
                resolveError: true,
                syncing: false,
                updatedAt: new Date()
            });

            return;
        }
        logger.info(`Resolved source information in ${source.type}`);

        await createNotifications(source, game, resolvedGameData, em);

        await em.nativeUpdate(InfoSource, source.id, {
            resolveError: false,
            syncing: false,
            data: resolvedGameData,
            updatedAt: new Date()
        });
    }));


    await em.nativeUpdate(Game, game.id, {
        syncing: false,
        updatedAt: new Date()
    });

    const duration = new Date().getTime() - startTime;
    logger.debug(`Resolving for game took ${duration} ms`);
};
