import { InfoSource } from "@game-watch/database";
import { Logger } from "@game-watch/service";
import { EntityManager } from "@mikro-orm/core";

import { createNotifications } from "./create-notifications";
import { ResolveService } from "./resolve-service";

interface Params {
    sourceId: string
    initialRun?: boolean;
    skipCache?: boolean;
    resolveService: ResolveService
    em: EntityManager
    logger: Logger
}

export const resolveSource = async ({ sourceId, initialRun, skipCache, resolveService, em, logger }: Params) => {
    const startTime = new Date().getTime();

    const source = await em.findOneOrFail(InfoSource, sourceId, { populate: ["game"] });
    if (source.disabled || source.remoteGameId === null) {
        return;
    }

    logger.info(`Resolving ${source.type}`);

    const resolvedGameData = await resolveService.resolveGameInformation(
        source.remoteGameId,
        source.type,
        { logger, skipCache }
    );
    if (!resolvedGameData) {
        logger.warn(`Source ${source.type} could not be resolved`);

        source.resolveError = true;
        source.syncing = false;
        await em.persistAndFlush(source);

        return;
    }
    logger.info(`Resolved source information in ${source.type}`);

    if (!initialRun) {
        await createNotifications({ infoSource: source, game: source.game.getEntity(), resolvedGameData, em, logger });
    }

    source.resolveError = false;
    source.syncing = false;
    source.data = resolvedGameData;
    await em.persistAndFlush(source);

    const duration = new Date().getTime() - startTime;
    logger.debug(`Resolving source took ${duration} ms`);
};
