import * as dotenv from "dotenv";
import path from 'path';
dotenv.config({ path: path.join(__dirname, "..", "..", '.env') });

import { mikroOrmConfig } from "@game-watch/database";
import { createWorkerForQueue, QueueType } from "@game-watch/queue";
import { createLogger, initializeSentry, parseEnvironment } from "@game-watch/service";
import { MikroORM } from "@mikro-orm/core";
import * as Sentry from '@sentry/node';
import { Worker } from "bullmq";

import { createNotifications } from "./create-notifications";
import { EnvironmentStructure } from "./environment";

const {
    CREATE_NOTIFICATIONS_CONCURRENCY,
} = parseEnvironment(EnvironmentStructure, process.env);

initializeSentry("Notifier");

const logger = createLogger("Notifier");

let createNotificationsWorker: Worker | undefined;

const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);

    createNotificationsWorker = createWorkerForQueue(QueueType.CreateNotifications, async ({ data: { sourceId, existingGameData, resolvedGameData } }) => {
        const sourceScopedLogger = logger.child({ sourceId });

        try {
            await createNotifications({
                sourceId,
                existingGameData,
                resolvedGameData,
                logger: sourceScopedLogger,
                em: orm.em.fork(),
            });
        } catch (error) {
            // Need to wrap this because otherwise the error is swallowed by the worker.
            logger.error(error);
            Sentry.captureException(error, { tags: { sourceId } });
            throw error;
        }
    }, { concurrency: CREATE_NOTIFICATIONS_CONCURRENCY, });

    createNotificationsWorker.on("error", error => {
        logger.error(error);
        Sentry.captureException(error);
    });

    logger.info("Listening for events");
};

main().catch(error => {
    logger.error(error);
    if (createNotificationsWorker) {
        createNotificationsWorker.close();
    }
    process.exit(1);
});
