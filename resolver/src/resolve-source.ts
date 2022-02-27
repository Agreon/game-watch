import { InfoSource } from "@game-watch/database";
import { Logger } from "@game-watch/service";
import { EntityManager } from "@mikro-orm/core";

import { createNotifications } from "./create-notifications";
import { ResolveService } from "./resolve-service";

interface Params {
    sourceId: string;
    resolveService: ResolveService,
    em: EntityManager;
    logger: Logger;
}

export const resolveSource = async ({ sourceId, resolveService, em, logger }: Params) => {
    const startTime = new Date().getTime();

    const source = await em.findOneOrFail(InfoSource, sourceId, ["game"]);
    if (source.disabled || source.remoteGameId === null) {
        return;
    }

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
            updatedAt: new Date()
        });

        return;
    }
    logger.info(`Resolved source information in ${source.type}`);

    await createNotifications({ infoSource: source, game: source.game.getEntity(), resolvedGameData, em });

    await em.nativeUpdate(InfoSource, sourceId, {
        resolveError: false,
        syncing: false,
        data: resolvedGameData,
        updatedAt: new Date()
    });

    const duration = new Date().getTime() - startTime;
    logger.debug(`Resolving source took ${duration} ms`);
};
