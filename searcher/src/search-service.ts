import { Game, InfoSource } from '@game-watch/database';
import {
    MANUALLY_TRIGGERED_JOB_OPTIONS,
    NIGHTLY_JOB_OPTIONS,
    QueueParams,
    QueueType,
} from '@game-watch/queue';
import { CacheService, getCronForNightlySync, Logger } from '@game-watch/service';
import { BaseGameData, Country, InfoSourceState, InfoSourceType } from '@game-watch/shared';
import { EntityManager } from '@mikro-orm/core';
import axios from 'axios';
import { Queue } from 'bullmq';

export interface InfoSearcherContext {
    logger: Logger
    userCountry: Country
}

export interface InfoSearcher {
    type: InfoSourceType
    search(name: string, context: InfoSearcherContext): Promise<BaseGameData | null>
}

export class GameNotFoundError extends Error {
    public constructor(public sourceType: InfoSourceType) { super(); }
}

export class CriticalError extends Error {
    public constructor(
        public sourceType: InfoSourceType,
        public originalError: Error
    ) { super(); }
}

export class SearchService {
    public constructor(
        private readonly searchers: InfoSearcher[],
        private readonly cacheService: CacheService,
        private readonly resolveSourceQueue: Queue<QueueParams[QueueType.ResolveSource]>,
        private readonly em: EntityManager,
        private readonly gameScopedLogger: Logger,
        private readonly isLastAttempt: boolean,
        private readonly triggeredManually?: boolean
    ) { }

    public async searchForGame(
        { gameId, excludedSourceTypes }: {
            gameId: string
            excludedSourceTypes: InfoSourceType[]
        },
    ) {
        const startTime = new Date().getTime();

        const game = await this.em.findOneOrFail(
            Game,
            gameId,
            { populate: ['infoSources', 'user'] }
        );
        const { country: userCountry, interestedInSources } = game.user.get();

        const logger = this.gameScopedLogger.child({ userCountry, search: game.search });

        const existingInfoSources = game.infoSources.getItems();

        // Search possible new sources
        const newSourcesToSearchFor = interestedInSources.filter(
            type =>
                !existingInfoSources.map(({ type }) => type).includes(type)
                && !excludedSourceTypes.includes(type)
        );

        logger.info(`Searching for ${JSON.stringify(newSourcesToSearchFor.map(source => source))}`);
        const searchForNewSourcesPromises = newSourcesToSearchFor.map(
            async sourceType => await this.searchForNewSource({
                game,
                sourceType,
                userCountry,
                logger
            })
        );

        // Re-Search for disabled sources.
        const disabledSources = existingInfoSources.filter(
            ({ state, continueSearching }) =>
                state === InfoSourceState.Disabled && continueSearching
        );

        logger.info(
            `Re-Searching for ${JSON.stringify(disabledSources.map(source => source.type))}`
        );
        const researchSourcesPromises = disabledSources.map(
            async source => await this.searchForExistingSource({
                game,
                source,
                userCountry,
                logger
            })
        );

        await this.handleSearchErrors({
            promises: [...searchForNewSourcesPromises, ...researchSourcesPromises],
            game,
            logger,
        });

        // We already set syncing to false here to signal the AddGameModal that the search is done.
        await this.em.nativeUpdate(Game, game.id, {
            syncing: false,
            updatedAt: new Date()
        });

        const duration = new Date().getTime() - startTime;
        logger.debug(`Searching for game took ${duration} ms`);
    }

    private async searchForNewSource({ logger, game, userCountry, sourceType }: {
        logger: Logger
        game: Game
        userCountry: Country
        sourceType: InfoSourceType
    }) {
        const sourceScopedLogger = logger.child({ type: sourceType });
        sourceScopedLogger.info(`Searching ${sourceType} for '${game.search}'`);

        const searchResponse = await this.searchForGameInSource(
            game.search,
            sourceType,
            { logger: sourceScopedLogger, userCountry });

        sourceScopedLogger.info(
            `Found game information in ${sourceType} for '${game.search}': '${searchResponse.id}'`
        );

        const newSource = new InfoSource({
            state: InfoSourceState.Found,
            data: searchResponse,
            type: sourceType,
            game,
            user: game.user,
            country: userCountry,
        });

        await this.em.nativeInsert(newSource);

        await this.addSourceToResolveQueues(newSource.id, userCountry);
    }

    private async searchForExistingSource({ logger, game, userCountry, source }: {
        logger: Logger
        game: Game
        userCountry: Country
        source: InfoSource
    }) {
        const sourceScopedLogger = logger.child({ type: source.type, sourceId: source.id });
        sourceScopedLogger.info(`Re-Searching ${source.type} for '${game.search}'`);

        const searchResponse = await this.searchForGameInSource(
            game.search,
            source.type,
            { logger: sourceScopedLogger, userCountry }
        );
        if (source.excludedRemoteGameIds.includes(searchResponse.id)) {
            sourceScopedLogger.info(
                `No new store game information found in '${source.type}' for '${game.search}'`
            );
            return;
        }
        sourceScopedLogger.info(
            `Found game information in ${source.type} for '${game.search}': '${searchResponse.id}'`
        );

        source.state = InfoSourceState.Found;
        source.data = searchResponse;

        await this.em.nativeUpdate(InfoSource, source.id, {
            state: InfoSourceState.Found,
            data: searchResponse,
            updatedAt: new Date(),
            foundAt: new Date(),
            country: userCountry,
        });

        await this.addSourceToResolveQueues(source.id, userCountry);
    }

    private async searchForGameInSource(
        search: string,
        type: InfoSourceType,
        context: InfoSearcherContext
    ): Promise<BaseGameData> {
        const { logger, userCountry } = context;

        const cacheKey = `${type}:${userCountry}:${search}`.toLocaleLowerCase();
        const existingData = await this.cacheService.get<BaseGameData>(cacheKey);
        if (existingData) {
            logger.debug(`Search data for ${cacheKey} was found in cache`);

            return existingData;
        }

        const start = new Date().getTime();

        try {
            const foundData = await this
                .getSearcherForTypeOrFail(type)
                .search(search, context);
            if (!foundData) {
                throw new GameNotFoundError(type);
            }

            await this.cacheService.set(cacheKey, foundData);

            return foundData;
        } catch (error) {
            if (!(error instanceof GameNotFoundError)) {
                logger.warn(error, `Error thrown while searching ${type} for ${search}`);
            }

            if (
                error instanceof GameNotFoundError
                // We only want to retry on network errors that are not signaling us to stop.
                || (
                    axios.isAxiosError(error)
                    &&
                    (
                        error.response?.status === undefined
                        || [400, 401, 403, 429].includes(error.response.status) === false
                    )
                )
                // This error occurs if Puppeteer timeouts.
                || error.name === 'TimeoutError'
            ) {
                throw error;
            }

            logger.warn("Retrying likely won't help. Aborting immediately");
            throw new CriticalError(type, error);
        } finally {
            const duration = new Date().getTime() - start;
            logger.debug(`Searching ${type} took ${duration} ms`);
        }
    }

    private getSearcherForTypeOrFail(type: InfoSourceType): InfoSearcher {
        const searcherForType = this.searchers.find(searcher => searcher.type == type);
        if (!searcherForType) {
            throw new Error(`No searcher for type ${type} found`);
        }
        return searcherForType;
    }

    private async addSourceToResolveQueues(sourceId: string, userCountry: Country) {
        await this.resolveSourceQueue.add(
            QueueType.ResolveSource,
            {
                sourceId,
                triggeredManually: this.triggeredManually
            },
            {
                jobId: sourceId,
                priority: 1,
                ...(this.triggeredManually ? MANUALLY_TRIGGERED_JOB_OPTIONS : NIGHTLY_JOB_OPTIONS)
            }
        );

        await this.resolveSourceQueue.add(
            QueueType.ResolveSource,
            { sourceId },
            {
                repeat: {
                    cron: getCronForNightlySync(userCountry)
                },
                jobId: sourceId,
                priority: 2,
                ...NIGHTLY_JOB_OPTIONS
            }
        );
    }

    private async handleSearchErrors({ promises, game, logger }: {
        promises: Promise<void>[],
        game: Game,
        logger: Logger
    }) {
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
            if (this.isLastAttempt) {
                // We already set syncing to false here to signal the AddGameModal that the
                // search is done.
                await this.em.nativeUpdate(Game, game.id, {
                    syncing: false,
                    updatedAt: new Date()
                });
            }
            throw errorToThrow;
        }

    }

}
