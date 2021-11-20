import { mikroOrmConfig } from "@game-watch/database";
import { createWorkerForQueue, QueueType } from "@game-watch/queue";
import { createLogger } from "@game-watch/service";
import { MikroORM } from "@mikro-orm/core";
import { Worker } from "bullmq";

import { resolveGame } from "./resolve-game";
import { ResolveService } from "./resolve-service";
import { resolveSource } from "./resolve-source";
import { EpicResolver } from "./resolvers/epic-resolver";
import { MetacriticResolver } from "./resolvers/metacritic-resolver";
import { PsStoreResolver } from "./resolvers/ps-store-resolver";
import { SteamResolver } from "./resolvers/steam-resolver";
import { SwitchResolver } from "./resolvers/switch-resolver";

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

    resolveGameWorker = createWorkerForQueue(QueueType.ResolveGame, async ({ data: { gameId } }) => {
        const gameScopedLogger = logger.child({ gameId });

        try {
            await resolveGame({
                gameId,
                resolveService,
                logger: gameScopedLogger,
                em: orm.em.fork(),
            });
        } catch (error) {
            // Need to wrap this because otherwise the error is swallowed by the worker.
            logger.error(error);
            throw error;
        }
    });

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
            // Need to wrap this because otherwise the error is swallowed by the worker.
            logger.error(error);
            throw error;
        }
    });

    logger.info("Listening for events");
};

main().catch(error => {
    if (resolveGameWorker) {
        resolveGameWorker.close();
    }
    if (resolveSourceWorker) {
        resolveSourceWorker.close();
    }
    logger.error(error);
    process.exit(1);
});
