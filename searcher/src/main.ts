import * as dotenv from "dotenv";
import path from 'path';
dotenv.config({ path: path.join(__dirname, "..", "..", '.env') });

import { mikroOrmConfig } from "@game-watch/database";
import { createQueue, createWorkerForQueue, QueueType } from "@game-watch/queue";
import { createLogger, initializeSentry, parseEnvironment } from "@game-watch/service";
import { MikroORM, NotFoundError } from "@mikro-orm/core";
import * as Sentry from '@sentry/node';
import { Worker } from "bullmq";
import Redis from "ioredis";

import { EnvironmentStructure } from "./environment";
import { searchForGame } from "./search-for-game";
import { SearchService } from "./search-service";
import { EpicSearcher } from "./searchers/epic-searcher";
import { MetacriticSearcher } from "./searchers/metacritic-searcher";
import { PsStoreSearcher } from "./searchers/ps-store-searcher";
import { SteamSearcher } from "./searchers/steam-searcher";
import { SwitchSearcher } from "./searchers/switch-searcher";

const {
    SEARCH_GAME_CONCURRENCY,
    SYNC_SOURCES_AT,
    REDIS_HOST,
    REDIS_PASSWORD,
    REDIS_PORT,
} = parseEnvironment(EnvironmentStructure, process.env);

initializeSentry("Searcher");

const logger = createLogger("Searcher");

let worker: Worker | undefined;


const redis = new Redis({
    host: REDIS_HOST,
    password: REDIS_PASSWORD,
    port: REDIS_PORT
});


const searchService = new SearchService([
    new EpicSearcher(),
    new MetacriticSearcher(),
    new PsStoreSearcher(),
    new SteamSearcher(),
    new SwitchSearcher()
], redis);

const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);

    const resolveGameQueue = createQueue(QueueType.ResolveGame);
    const resolveSourceQueue = createQueue(QueueType.ResolveSource);
    const searchGameQueue = createQueue(QueueType.SearchGame);

    worker = createWorkerForQueue(QueueType.SearchGame, async ({ data: { gameId, initialRun } }) => {
        const gameScopedLogger = logger.child({ gameId });
        try {
            await searchForGame({
                gameId,
                searchService,
                logger: gameScopedLogger,
                em: orm.em.fork(),
                resolveSourceQueue
            });

            await resolveGameQueue.add(QueueType.ResolveGame, { gameId, initialRun });
        } catch (error) {
            if (error instanceof NotFoundError) {
                logger.warn(`Game '${gameId}' could not be found in database`);

                searchGameQueue.removeRepeatableByKey(
                    `${QueueType.SearchGame}:${gameId}:::${SYNC_SOURCES_AT}`
                );
                return;
            }
            // Need to wrap this because otherwise the error is swallowed by the worker.
            logger.error(error);
            Sentry.captureException(error, { tags: { gameId } });
            throw error;
        }
    }, { concurrency: SEARCH_GAME_CONCURRENCY });

    worker.on("error", error => {
        logger.error(error);
        Sentry.captureException(error);
    });

    logger.info("Listening for events");
};

main().catch(error => {
    logger.error(error);
    if (worker) {
        worker.close();
    }
    process.exit(1);
});
