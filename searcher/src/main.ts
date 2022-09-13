/* eslint-disable @typescript-eslint/no-var-requires */
import * as dotenv from "dotenv";
import path from 'path';
dotenv.config({ path: path.join(__dirname, "..", "..", '.env') });

import { mikroOrmConfig } from "@game-watch/database";
import { createQueue, createWorkerForQueue, QueueType } from "@game-watch/queue";
import { createLogger, InfoSearcher, initializeSentry, parseEnvironment } from "@game-watch/service";
import { Constructor, MikroORM, NotFoundError } from "@mikro-orm/core";
import * as Sentry from '@sentry/node';
import axios from "axios";
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

// Fail fast
const axiosInstance = axios.create({ timeout: 10000 });

// import glob from "glob";

// const searchers: Record<string, Constructor<InfoSearcher>> = {};

// const sourcesPath = path.join(process.cwd(), ".." ,"sources", "**", "*-searcher.ts");
// const sourcesPath = path.join(process.cwd(), ".." ,"sources", "**", "main.ts");

// glob.sync(sourcesPath).forEach(file => {
//     const pathParts = file.split("/");
//     const sourceName = pathParts[pathParts.length - 2];

//     const { Searcher } = require(file);

//     searchers[sourceName] = Searcher;
// });

// const searcher = new searchers["steam"](axiosInstance);

const searchService = new SearchService([
    new EpicSearcher(axiosInstance),
    new MetacriticSearcher(axiosInstance),
    new PsStoreSearcher(),
    new SteamSearcher(axiosInstance),
    new SwitchSearcher(axiosInstance)
], redis);

const main = async () => {
    // const result = await searcher.search("Mario", { logger, userCountry: "DE" });
    // console.log(result);

    const orm = await MikroORM.init(mikroOrmConfig);

    const resolveSourceQueue = createQueue(QueueType.ResolveSource);
    const searchGameQueue = createQueue(QueueType.SearchGame);

    worker = createWorkerForQueue(QueueType.SearchGame, async ({ data: { gameId, initialRun } }) => {
        const gameScopedLogger = logger.child({ gameId });
        try {
            await searchForGame({
                gameId,
                initialRun,
                searchService,
                logger: gameScopedLogger,
                em: orm.em.fork(),
                resolveSourceQueue
            });
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
