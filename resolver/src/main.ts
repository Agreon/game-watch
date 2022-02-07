import * as dotenv from "dotenv";
import path from 'path';
dotenv.config({ path: path.join(__dirname, "..", "..", '.env') });

import { mikroOrmConfig } from "@game-watch/database";
import { createQueue, createWorkerForQueue, QueueType } from "@game-watch/queue";
import { createLogger, initializeSentry, parseEnvironment } from "@game-watch/service";
import { MikroORM, NotFoundError } from "@mikro-orm/core";
import * as Sentry from '@sentry/node';
import { Worker } from "bullmq";

import { EnvironmentStructure } from "./environment";
import { resolveGame } from "./resolve-game";
import { ResolveService } from "./resolve-service";
import { resolveSource } from "./resolve-source";
import { EpicResolver } from "./resolvers/epic-resolver";
import { MetacriticResolver } from "./resolvers/metacritic-resolver";
import { PsStoreResolver } from "./resolvers/ps-store-resolver";
import { SteamResolver } from "./resolvers/steam-resolver";
import { SwitchResolver } from "./resolvers/switch-resolver";

const { RESOLVE_GAME_CONCURRENCY, RESOLVE_SOURCE_CONCURRENCY } = parseEnvironment(EnvironmentStructure, process.env);

initializeSentry("Resolver");

const logger = createLogger("Resolver");

let resolveGameWorker: Worker | undefined;
let resolveSourceWorker: Worker | undefined;

const resolveService = new ResolveService([
    new SteamResolver(),
    new SwitchResolver(),
    new PsStoreResolver(),
    new EpicResolver(),
    new MetacriticResolver(),
]);

const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);

    resolveGameWorker = createWorkerForQueue(QueueType.ResolveGame, async ({ data: { gameId, initialRun } }) => {
        const gameScopedLogger = logger.child({ gameId });

        try {
            await resolveGame({
                gameId,
                initialRun,
                resolveService,
                logger: gameScopedLogger,
                em: orm.em.fork(),
            });
        } catch (error) {
            // Need to wrap this because otherwise the error is swallowed by the worker.
            logger.error(error);
            Sentry.captureException(error, { tags: { gameId } });
            throw error;
        }
    }, { concurrency: RESOLVE_GAME_CONCURRENCY });

    resolveGameWorker.on("error", error => {
        logger.error(error);
        Sentry.captureException(error);
    });

    const resolveSourceQueue = createQueue(QueueType.ResolveSource);

    resolveSourceWorker = createWorkerForQueue(QueueType.ResolveSource, async ({ data: { sourceId } }) => {
        const sourceScopedLogger = logger.child({ sourceId });

        try {
            await resolveSource({
                sourceId,
                resolveService,
                logger: sourceScopedLogger,
                em: orm.em.fork(),
            });
        } catch (error) {
            if (error instanceof NotFoundError) {
                logger.warn(`Source '${sourceId}' could not be found in database`);

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

    resolveGameWorker.on("error", error => {
        logger.error(error);
        Sentry.captureException(error);
    });

    logger.info("Listening for events");
};

main().catch(error => {
    logger.error(error);
    if (resolveGameWorker) {
        resolveGameWorker.close();
    }
    if (resolveSourceWorker) {
        resolveSourceWorker.close();
    }
    process.exit(1);
});
