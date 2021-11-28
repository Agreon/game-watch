import { InfoSource } from "@game-watch/database";
import { Logger } from "@game-watch/service";
import { EntityManager } from "@mikro-orm/core";

import { ResolveService } from "./resolve-service";

interface Params {
    sourceId: string;
    resolveService: ResolveService,
    em: EntityManager;
    logger: Logger;
}

export const resolveSource = async ({ sourceId, resolveService, em, logger }: Params) => {
    const startTime = new Date().getTime();

    const source = await em.findOneOrFail(InfoSource, sourceId);

    logger.info(`Resolving ${source.type}`);

    const resolvedGameData = await resolveService.resolveGameInformation(
        source.remoteGameId,
        source.type,
        { logger }
    );
    if (!resolvedGameData) {
        logger.warn(`Source ${source.type} could not be resolved`);

        await em.nativeUpdate(InfoSource, sourceId, {
            resolveError: true,
            syncing: false,
        });

        return;
    }
    logger.info(`Resolved source information in ${source.type}`);

    await em.nativeUpdate(InfoSource, sourceId, {
        resolveError: false,
        syncing: false,
        data: resolvedGameData
    });

    const duration = new Date().getTime() - startTime;
    logger.debug(`Resolving source took ${duration} ms`);
};
