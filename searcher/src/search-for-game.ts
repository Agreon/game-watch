import { Game, InfoSource } from "@game-watch/database";
import { QueueType } from "@game-watch/queue";
import { Logger } from "@game-watch/service";
import { InfoSourceType } from "@game-watch/shared";
import { EntityManager } from "@mikro-orm/core";
import { Queue } from "bullmq";

import { SearchService } from "./search-service";

interface Params {
    gameId: string;
    searchService: SearchService,
    resolveSourceQueue: Queue;
    em: EntityManager;
    logger: Logger;
}

export const searchForGame = async ({ gameId, searchService, em, logger, resolveSourceQueue }: Params) => {
    const startTime = new Date().getTime();

    const game = await em.findOneOrFail(Game, gameId, ["infoSources"]);
    const existingInfoSources = await game.infoSources.loadItems();

    // Search possible new sources
    const sourcesToSearch = Object.values(InfoSourceType).filter(
        (type => !existingInfoSources.map(({ type }) => type).includes(type))
    );

    logger.info(`Searching for ${JSON.stringify(sourcesToSearch)}`);

    await Promise.all(sourcesToSearch.map(async sourceType => {
        logger.info(`Searching ${sourceType} for '${game.search}'`);

        const remoteGameId = await searchService.searchForGameInSource(game.search, sourceType, { logger });
        if (!remoteGameId) {
            logger.info(`No store game information found in '${sourceType}' for '${game.search}'`);
            return;
        }
        logger.info(`Found game information in ${sourceType} for '${game.search}': '${remoteGameId}'`);

        const newSource = new InfoSource({
            type: sourceType,
            remoteGameId,
            game,
        });

        await em.nativeInsert(newSource);

        // Add nightly job
        await resolveSourceQueue.add(
            QueueType.ResolveSource,
            { sourceId: newSource.id },
            {
                repeat: {
                    cron: process.env.SYNC_SOURCES_AT
                },
                jobId: newSource.id,
                priority: 2
            }
        );
    }));

    const duration = new Date().getTime() - startTime;
    logger.debug(`Searching for game took ${duration} ms`);
};
