import { Game, InfoSource } from "@game-watch/database";
import { Logger } from "@game-watch/service";
import { EntityManager } from "@mikro-orm/core";

import { createNotifications } from "./create-notifications";
import { ResolveService } from "./resolve-service";

interface Params {
    gameId: string;
    resolveService: ResolveService,
    em: EntityManager;
    logger: Logger;
}


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

        await createNotifications({ infoSource: source, game, resolvedGameData, em });

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
