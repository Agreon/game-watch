import { Game } from "@game-watch/database";
import { Logger } from "@game-watch/service";
import { EntityManager } from "@mikro-orm/core";

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

            source.resolveError = true;
            await em.persistAndFlush(source);

            return;
        }
        logger.info(`Resolved game information in ${source.type}`);

        source.resolveError = false;
        source.syncing = false;
        source.data = resolvedGameData;
        await em.persistAndFlush(source);
    }));

    game.syncing = false;
    await em.persistAndFlush(game);

    const duration = new Date().getTime() - startTime;
    logger.debug(`Resolving for game took ${duration} ms`);
};
