import { Game, InfoSource } from "@game-watch/database";
import { Logger } from "@game-watch/service";
import { EntityManager } from "@mikro-orm/core";

import { createNotifications } from "./create-notifications";
import { ResolveService } from "./resolve-service";

interface Params {
    gameId: string;
    initialRun?: boolean;
    skipCache?: boolean;
    resolveService: ResolveService,
    em: EntityManager;
    logger: Logger;
}

export const resolveGame = async ({ gameId, initialRun, skipCache, resolveService, em, logger }: Params) => {
    const startTime = new Date().getTime();

    const game = await em.findOneOrFail(Game, gameId, { populate: ["infoSources"] });

    const sourcesToResolve = (await game.infoSources.loadItems())
        .filter(source => !source.disabled && source.remoteGameId !== null);

    logger.info(`Resolving for ${JSON.stringify(sourcesToResolve.map(({ type }) => type))}`);

    await Promise.all(sourcesToResolve.map(async source => {
        const sourceLogger = logger.child({ sourceId: source.id });
        sourceLogger.info(`Resolving ${source.type}`);

        const resolvedGameData = await resolveService.resolveGameInformation(
            source.getRemoteGameIdOrFail(),
            source.type,
            { logger: sourceLogger, skipCache }
        );
        if (!resolvedGameData) {
            sourceLogger.warn(`Source ${source.type} could not be resolved`);

            await em.nativeUpdate(InfoSource, source.id, {
                resolveError: true,
                syncing: false,
                updatedAt: new Date()
            });

            return;
        }
        sourceLogger.info(`Resolved source information in ${source.type}`);

        if (!initialRun) {
            await createNotifications({
                infoSource: source,
                game: source.game.getEntity(),
                resolvedGameData,
                em,
                logger: sourceLogger,
            });
        }

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
