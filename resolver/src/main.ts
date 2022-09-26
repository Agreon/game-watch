import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import { mikroOrmConfig } from '@game-watch/database';
import { createQueue, createWorkerForQueue, QueueType } from '@game-watch/queue';
import { createLogger, initializeSentry, parseEnvironment } from '@game-watch/service';
import { MikroORM, NotFoundError } from '@mikro-orm/core';
import * as Sentry from '@sentry/node';
import axios from 'axios';
import { Worker } from 'bullmq';
import Redis from 'ioredis';

import { EnvironmentStructure } from './environment';
import { ResolveService } from './resolve-service';
import { resolveSource } from './resolve-source';
import { EpicResolver } from './resolvers/epic-resolver';
import { MetacriticResolver } from './resolvers/metacritic-resolver';
import { PsStoreResolver } from './resolvers/ps-store-resolver';
import { SteamResolver } from './resolvers/steam-resolver';
import { SwitchResolver } from './resolvers/switch-resolver';

const {
    RESOLVE_SOURCE_CONCURRENCY,
    REDIS_HOST,
    REDIS_PASSWORD,
    REDIS_PORT,
    CACHING_ENABLED
} = parseEnvironment(EnvironmentStructure, process.env);

initializeSentry('Resolver');

const logger = createLogger('Resolver');

let resolveSourceWorker: Worker | undefined;

const redis = new Redis({
    host: REDIS_HOST,
    password: REDIS_PASSWORD,
    port: REDIS_PORT
});

// Fail fast
const axiosInstance = axios.create({ timeout: 10000, maxRedirects: 2 });

const resolveService = new ResolveService([
    new SteamResolver(axiosInstance),
    new SwitchResolver(axiosInstance),
    new PsStoreResolver(axiosInstance),
    new EpicResolver(axiosInstance),
    new MetacriticResolver(axiosInstance),
], redis, CACHING_ENABLED);

const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);

    const resolveSourceQueue = createQueue(QueueType.ResolveSource);
    const createNotificationsQueue = createQueue(QueueType.CreateNotifications);

    resolveSourceWorker = createWorkerForQueue(
        QueueType.ResolveSource,
        async ({ data: { sourceId, initialRun, skipCache } }) => {
            const sourceScopedLogger = logger.child({ sourceId });

            try {
                await resolveSource({
                    sourceId,
                    initialRun,
                    skipCache,
                    resolveService,
                    createNotificationsQueue,
                    logger: sourceScopedLogger,
                    em: orm.em.fork(),
                });
            } catch (error) {
                if (error instanceof NotFoundError) {
                    logger.warn(`Source '${sourceId}' could not be found in database or is not resolvable. Removing nightly job`);

                    resolveSourceQueue.removeRepeatableByKey(
                        `${QueueType.ResolveSource}:${sourceId}:::${process.env.SYNC_SOURCES_AT}`
                    );
                    return;
                }
                // Need to wrap this because otherwise the error is swallowed by the worker.
                logger.error(error);
                Sentry.captureException(error, { tags: { sourceId } });
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
