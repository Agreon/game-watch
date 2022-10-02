import { Game, InfoSource } from '@game-watch/database';
import {
    MANUALLY_TRIGGERED_JOB_OPTIONS,
    NIGHTLY_JOB_OPTIONS,
    QueueParams,
    QueueType,
} from '@game-watch/queue';
import { Logger } from '@game-watch/service';
import { InfoSourceState, InfoSourceType } from '@game-watch/shared';
import { EntityManager } from '@mikro-orm/core';
import { Queue } from 'bullmq';

import { CriticalError, GameNotFoundError, SearchService } from './search-service';

interface Params {
    gameId: string
    triggeredManually?: boolean
    isLastAttempt?: boolean
    excludedSourceTypes: InfoSourceType[],
    searchService: SearchService
    resolveSourceQueue: Queue<QueueParams[QueueType.ResolveSource]>
    em: EntityManager
    logger: Logger
}

export const searchForGame = async (
    {
        gameId,
        triggeredManually,
        isLastAttempt,
        searchService,
        excludedSourceTypes,
        em,
        logger,
        resolveSourceQueue,
    }: Params
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
        type =>
            !existingInfoSources.map(({ type }) => type).includes(type)
            && !excludedSourceTypes.includes(type)
    );

    const addSourceToResolveQueues = async (sourceId: string) => {
        await resolveSourceQueue.add(
            QueueType.ResolveSource,
            {
                sourceId,
                triggeredManually
            },
            {
                jobId: sourceId,
                priority: 1,
                ...(triggeredManually ? MANUALLY_TRIGGERED_JOB_OPTIONS : NIGHTLY_JOB_OPTIONS)
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
                priority: 2,
                ...NIGHTLY_JOB_OPTIONS
            }
        );
    };

    logger.info(`Searching for ${JSON.stringify(sourcesToSearchFor.map(source => source))}`);

    const searchForNewSourcesPromises = sourcesToSearchFor.map(async sourceType => {
        logger.info(`Searching ${sourceType} for '${game.search}'`);

        const searchResponse = await searchService.searchForGameInSource(
            game.search,
            sourceType,
            { logger, userCountry });

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
            { logger, userCountry }
        );
        if (source.excludedRemoteGameIds.includes(searchResponse.id)) {
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

    await handleSearchErrors({
        promises: [...searchForNewSourcesPromises, ...researchSourcesPromises],
        em,
        game,
        logger,
        isLastAttempt
    });

    // We already set syncing to false here to signal the AddGameModal that the search is done.
    await em.nativeUpdate(Game, game.id, {
        syncing: false,
        updatedAt: new Date()
    });

    const duration = new Date().getTime() - startTime;
    logger.debug(`Searching for game took ${duration} ms`);
};

const handleSearchErrors = async ({ promises, em, game, logger, isLastAttempt }: {
    promises: Promise<void>[],
    em: EntityManager,
    game: Game,
    logger: Logger,
    isLastAttempt?: boolean
}) => {
    const promiseResults = await Promise.allSettled(promises);
    const errors = promiseResults.flatMap(result =>
        result.status === 'rejected' ? [result.reason] : []
    );

    // GameNotFoundError are not relevant. We just log them.
    const notFoundErrors: GameNotFoundError[] = errors.filter(
        error => error instanceof GameNotFoundError
    );
    notFoundErrors.map(({ sourceType }) =>
        logger.info(`No store game information found in '${sourceType}' for '${game.search}'`)
    );

    let errorToThrow = errors.find(error => !(error instanceof GameNotFoundError));
    // Critical errors are more relevant than normal ones.
    errorToThrow = errors.find(error => error instanceof CriticalError);

    if (errorToThrow) {
        if (isLastAttempt) {
            // We already set syncing to false here to signal the AddGameModal that the search is
            // done.
            await em.nativeUpdate(Game, game.id, {
                syncing: false,
                updatedAt: new Date()
            });
        }
        throw errorToThrow;
    }

};
