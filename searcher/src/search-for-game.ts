import { Game, InfoSource } from '@game-watch/database';
import { QueueParams, QueueType } from '@game-watch/queue';
import { Logger } from '@game-watch/service';
import { InfoSourceState } from '@game-watch/shared';
import { EntityManager } from '@mikro-orm/core';
import { Queue } from 'bullmq';

import { SearchService } from './search-service';

interface Params {
    gameId: string
    initialRun?: boolean
    searchService: SearchService
    resolveSourceQueue: Queue<QueueParams[QueueType.ResolveSource]>
    em: EntityManager
    logger: Logger
}

export const searchForGame = async (
    { gameId, initialRun, searchService, em, logger, resolveSourceQueue }: Params
) => {
    const startTime = new Date().getTime();

    const game = await em.findOneOrFail(Game, gameId, { populate: ['infoSources', 'user'] });
    const { country: userCountry, interestedInSources } = game.user.get();

    const existingInfoSources = game.infoSources.getItems();

    // Re-Search for disabled sources
    const disabledSources = existingInfoSources.filter(
        ({ state, continueSearching }) => state === InfoSourceState.Disabled && continueSearching
    );

    // Search possible new sources
    const sourcesToSearchFor = interestedInSources.filter(
        type => !existingInfoSources.map(({ type }) => type).includes(type)
    );

    const addSourceToResolveQueues = async (sourceId: string) => {
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

    logger.info(`Searching for ${JSON.stringify(sourcesToSearchFor.map(source => source))}`);

    const searchForNewSourcesPromises = sourcesToSearchFor.map(async sourceType => {
        logger.info(`Searching ${sourceType} for '${game.search}'`);

        const searchResponse = await searchService.searchForGameInSource(
            game.search,
            sourceType,
            { logger, userCountry, initialRun });

        if (!searchResponse) {
            logger.info(`No store game information found in '${sourceType}' for '${game.search}'`);
            return;
        }
        logger.info(
            `Found game information in ${sourceType} for '${game.search}': '${searchResponse.id}'`
        );

        const newSource = new InfoSource({
            state: InfoSourceState.Found,
            data: searchResponse,
            type: sourceType,
            game,
            user: game.user,
        });

        await em.nativeInsert(newSource);

        await addSourceToResolveQueues(newSource.id);
    });

    logger.info(`Re-Searching for ${JSON.stringify(disabledSources.map(source => source.type))}`);

    const researchSourcesPromises = disabledSources.map(async source => {
        logger.info(`Re-Searching ${source.type} for '${game.search}'`);

        const searchResponse = await searchService.searchForGameInSource(
            game.search,
            source.type,
            { logger, userCountry, initialRun }
        );
        if (!searchResponse || source.excludedRemoteGameIds.includes(searchResponse.id)) {
            logger.info(
                `No new store game information found in '${source.type}' for '${game.search}'`
            );
            return;
        }
        logger.info(
            `Found game information in ${source.type} for '${game.search}': '${searchResponse.id}'`
        );

        source.state = InfoSourceState.Found;
        source.data = searchResponse;

        await em.nativeUpdate(InfoSource, source.id, {
            state: InfoSourceState.Found,
            data: searchResponse,
            updatedAt: new Date(),
            foundAt: new Date(),
        });

        await addSourceToResolveQueues(source.id);
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
