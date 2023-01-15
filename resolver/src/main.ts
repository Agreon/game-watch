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
import { UnrecoverableError, Worker } from 'bullmq';
import Redis from 'ioredis';

import { EnvironmentStructure } from './environment';
import { CriticalError, ResolveService } from './resolve-service';
import { EpicResolver } from './resolvers/epic-resolver';
import { MetacriticResolver } from './resolvers/metacritic-resolver';
import { PlaystationResolver } from './resolvers/playstation-resolver';
import { ProtonResolver } from './resolvers/proton-resolver';
import { SteamResolver } from './resolvers/steam-resolver';
import { SwitchResolver } from './resolvers/switch-resolver';

const {
    RESOLVE_SOURCE_CONCURRENCY,
    REDIS_HOST,
    REDIS_PASSWORD,
    REDIS_PORT,
    CACHING_ENABLED,
    CACHE_TIME_IN_SECONDS
} = parseEnvironment(EnvironmentStructure, process.env);

initializeSentry('Resolver');

const logger = createLogger('Resolver');

let resolveSourceWorker: Worker | undefined;

// Fail fast
const axiosInstance = axios.create({ timeout: 10000, maxRedirects: 2 });

const cacheService = CACHING_ENABLED
    ? new RedisCacheService(
        new Redis({
            host: REDIS_HOST,
            password: REDIS_PASSWORD,
            port: REDIS_PORT
        }),
        CACHE_TIME_IN_SECONDS
    )
    : new NonCachingService();

const resolvers = [
    new SteamResolver(axiosInstance),
    new SwitchResolver(axiosInstance),
    new PlaystationResolver(axiosInstance),
    new EpicResolver(axiosInstance),
    new MetacriticResolver(axiosInstance),
    new ProtonResolver(axiosInstance),
];

const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);

    const resolveSourceQueue = createQueueHandle(QueueType.ResolveSource);
    const createNotificationsQueue = createQueueHandle(QueueType.CreateNotifications);

    resolveSourceWorker = createWorkerForQueue(
        QueueType.ResolveSource,
        async ({ data: { sourceId, triggeredManually }, attemptsMade, repeatJobKey }) => {
            const isLastAttempt = triggeredManually
                ? MANUALLY_TRIGGERED_JOB_OPTIONS.attempts === attemptsMade
                : NIGHTLY_JOB_OPTIONS.attempts === attemptsMade;

            const sourceScopedLogger = logger.child({ sourceId, attemptsMade, isLastAttempt });

            const resolveService = new ResolveService(
                resolvers,
                cacheService,
                createNotificationsQueue,
                orm.em.fork(),
                sourceScopedLogger
            );

            try {
                await resolveService.resolveSource({ sourceId, triggeredManually, isLastAttempt });
            } catch (error) {
                if (error instanceof NotFoundError) {
                    sourceScopedLogger.warn(
                        `Source '${sourceId}' could not be found in database. Removing nightly job`
                    );

                    if (repeatJobKey) {
                        resolveSourceQueue.removeRepeatableByKey(repeatJobKey);
                    }
                    return;
                }

                if (error instanceof CriticalError) {
                    // We need to wrap this because otherwise the error is swallowed by the worker.
                    sourceScopedLogger.error(error.originalError);
                    Sentry.captureException(error.originalError, {
                        tags: { sourceId },
                        contexts: { resolveParameters: { type: error.sourceType } }
                    });

                    // Abort immediately. Don't retry.
                    throw new UnrecoverableError();
                }

                if (isLastAttempt) {
                    // Need to wrap this because otherwise the error is swallowed by the worker.
                    sourceScopedLogger.error(error);
                    Sentry.captureException(error, { tags: { sourceId }, });
                } else {
                    sourceScopedLogger.warn(
                        error,
                        `Error thrown while resolving in attempt ${attemptsMade}. Will retry`
                    );
                }

                throw error;
            }
        }, { concurrency: RESOLVE_SOURCE_CONCURRENCY, });

    resolveSourceWorker.on('error', error => {
        logger.error(error);
        Sentry.captureException(error);
    });

    logger.info('Listening for events');
};

main().catch(error => {
    logger.error(error);
    if (resolveSourceWorker) {
        resolveSourceWorker.close();
    }
    process.exit(1);
});
