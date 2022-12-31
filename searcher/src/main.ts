import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '..', '.env') });

import { mikroOrmConfig } from '@game-watch/database';
import {
    createQueueHandle,
    createWorkerForQueue,
    MANUALLY_TRIGGERED_JOB_OPTIONS,
    NIGHTLY_JOB_OPTIONS,
    QueueType,
} from '@game-watch/queue';
import {
    createLogger,
    initializeSentry,
    NonCachingService,
    parseEnvironment,
    RedisCacheService,
} from '@game-watch/service';
import { MikroORM, NotFoundError } from '@mikro-orm/core';
import * as Sentry from '@sentry/node';
import axios from 'axios';
import { Worker } from 'bullmq';
import Redis from 'ioredis';

import { EnvironmentStructure } from './environment';
import { CriticalError, SearchService } from './search-service';
import { EpicSearcher } from './searchers/epic-searcher';
import { MetacriticSearcher } from './searchers/metacritic-searcher';
import { PlaystationSearcher } from './searchers/playstation-searcher';
import { SteamSearcher } from './searchers/steam-searcher';
import { SwitchSearcher } from './searchers/switch-searcher';

const {
    SEARCH_GAME_CONCURRENCY,
    REDIS_HOST,
    REDIS_PASSWORD,
    REDIS_PORT,
    CACHING_ENABLED,
    CACHE_TIME_IN_SECONDS
} = parseEnvironment(EnvironmentStructure, process.env);

initializeSentry('Searcher');

const logger = createLogger('Searcher');

let worker: Worker | undefined;

// Fail fast
const axiosInstance = axios.create({ timeout: 10000, maxRedirects: 2 });

const redis = new Redis({
    host: REDIS_HOST,
    password: REDIS_PASSWORD,
    port: REDIS_PORT
});

const searchers = [
    new EpicSearcher(axiosInstance),
    new MetacriticSearcher(axiosInstance),
    new PlaystationSearcher(axiosInstance),
    new SteamSearcher(axiosInstance),
    new SwitchSearcher(axiosInstance)
];

const cacheService = CACHING_ENABLED
    ? new RedisCacheService(
        redis,
        CACHE_TIME_IN_SECONDS
    )
    : new NonCachingService();

const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);

    const resolveSourceQueue = createQueueHandle(QueueType.ResolveSource);
    const searchGameQueue = createQueueHandle(QueueType.SearchGame);

    worker = createWorkerForQueue(
        QueueType.SearchGame,
        async ({ data: { gameId, triggeredManually }, attemptsMade, id: jobId, repeatJobKey }) => {
            const isLastAttempt = triggeredManually
                ? MANUALLY_TRIGGERED_JOB_OPTIONS.attempts === attemptsMade
                : NIGHTLY_JOB_OPTIONS.attempts === attemptsMade;

            const gameScopedLogger = logger.child({ gameId, attemptsMade, isLastAttempt });

            const searchService = new SearchService(
                searchers,
                cacheService,
                resolveSourceQueue,
                orm.em.fork(),
                gameScopedLogger,
                isLastAttempt,
                triggeredManually
            );

            try {
                const excludedSources = await redis.get(`exclude:${jobId}`);

                await searchService.searchForGame({
                    gameId,
                    excludedSourceTypes: excludedSources ? JSON.parse(excludedSources) : []
                });
            } catch (error) {
                if (error instanceof NotFoundError) {
                    gameScopedLogger.warn(`Game '${gameId}' could not be found in database`);

                    if (repeatJobKey) {
                        searchGameQueue.removeRepeatableByKey(repeatJobKey);
                    }
                    return;
                }

                if (error instanceof CriticalError) {
                    // We need to wrap this because otherwise the error is swallowed by the worker.
                    gameScopedLogger.error(error.originalError);
                    Sentry.captureException(error.originalError, {
                        tags: { gameId },
                        contexts: { searchParameters: { type: error.sourceType } }
                    });

                    // We don't abort here because other sources might hat a non critical error and
                    // we want them to be able to retry. So we just exclude the one with the
                    // critical error for the next retries.

                    let excludedSources = [error.sourceType];
                    const existingExcluded = await redis.get(`exclude:${jobId}`);
                    if (existingExcluded) {
                        excludedSources = [...JSON.parse(existingExcluded), error.sourceType];
                    }

                    await redis.set(
                        `exclude:${jobId}`,
                        JSON.stringify(excludedSources),
                        'EX',
                        // 1 hour.
                        60 * 60
                    );
                }

                if (isLastAttempt) {
                    gameScopedLogger.error(error);
                    Sentry.captureException(error, { tags: { gameId }, });
                }
                else {
                    gameScopedLogger.warn(
                        error,
                        `Error thrown while searching in attempt ${attemptsMade}. Will retry`
                    );
                }

                throw error;
            }
        },
        { concurrency: SEARCH_GAME_CONCURRENCY }
    );

    worker.on('error', error => {
        logger.error(error);
        Sentry.captureException(error);
    });

    logger.info('Listening for events');
};

main().catch(error => {
    logger.error(error);
    if (worker) {
        worker.close();
    }
    process.exit(1);
});
