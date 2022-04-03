import { Game, InfoSource } from "@game-watch/database";
import { QueueType } from "@game-watch/queue";
import { Logger } from "@game-watch/service";
import { InfoSourceType } from "@game-watch/shared";
import { EntityManager } from "@mikro-orm/core";
import { Queue } from "bullmq";

import { SearchService } from "./search-service";

interface Params {
    gameId: string
    initialRun?: boolean
    searchService: SearchService
    resolveSourceQueue: Queue
    em: EntityManager
    logger: Logger
}

export const searchForGame = async ({ gameId, initialRun, searchService, em, logger, resolveSourceQueue }: Params) => {
    const startTime = new Date().getTime();

    const game = await em.findOneOrFail(Game, gameId, { populate: ["infoSources"] });
    const existingInfoSources = await game.infoSources.loadItems();

    // Re-Search for excluded sources
    const excludedSources = existingInfoSources.filter(
        ({ disabled, remoteGameId }) => !disabled && remoteGameId === null
    );

    // Search possible new sources
    const sourcesToSearch = Object.values(InfoSourceType).filter(
        type => !existingInfoSources.map(({ type }) => type).includes(type)
    );

    logger.info(`Searching for ${JSON.stringify(sourcesToSearch)}`);

    const addSourceToResolveQueue = async (sourceId: string) => {
        await resolveSourceQueue.add(
            QueueType.ResolveSource,
            {
                sourceId,
                initialRun
            },
            {
                jobId: sourceId,
                priority: 1
            }
        );

        await resolveSourceQueue.add(
            QueueType.ResolveSource,
            { sourceId },
            {
                repeat: {
                    cron: process.env.SYNC_SOURCES_AT
                },
                jobId: sourceId,
                priority: 2
            }
        );
    };

    const searchForNewSourcesPromises = sourcesToSearch.map(async sourceType => {
        logger.info(`Searching ${sourceType} for '${game.search}'`);

        const searchResponse = await searchService.searchForGameInSource(game.search, sourceType, { logger });
        if (!searchResponse) {
            logger.info(`No store game information found in '${sourceType}' for '${game.search}'`);
            return;
        }
        logger.info(`Found game information in ${sourceType} for '${game.search}': '${searchResponse.remoteGameId}'`);

        const newSource = new InfoSource({
            ...searchResponse,
            type: sourceType,
            game,
            user: game.user,
        });

        await em.nativeInsert(newSource);

        await addSourceToResolveQueue(newSource.id);
    });

    logger.info(`Re-Searching for ${JSON.stringify(excludedSources)}`);

    const researchSourcesPromises = excludedSources.map(async source => {
        logger.info(`Re-Searching ${source.type} for '${game.search}'`);

        const searchResponse = await searchService.searchForGameInSource(game.search, source.type, { logger });
        if (!searchResponse || source.excludedRemoteGameIds.includes(searchResponse.remoteGameId)) {
            logger.info(`No new store game information found in '${source.type}' for '${game.search}'`);
            return;
        }
        logger.info(`Found game information in ${source.type} for '${game.search}': '${searchResponse.remoteGameId}'`);

        source.remoteGameId = searchResponse.remoteGameId;
        source.remoteGameName = searchResponse.remoteGameName;

        await em.nativeUpdate(InfoSource, source.id, {
            remoteGameId: searchResponse.remoteGameId,
            remoteGameName: searchResponse.remoteGameName,
        });

        await addSourceToResolveQueue(source.id);
    });

    await Promise.all([...searchForNewSourcesPromises, ...researchSourcesPromises]);

    await em.nativeUpdate(Game, game.id, {
        // We already set syncing to false here to signal the AddGameModal that the search is done.
        syncing: false,
        updatedAt: new Date()
    });

    const duration = new Date().getTime() - startTime;
    logger.debug(`Searching for game took ${duration} ms`);
};
