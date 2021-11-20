import { Processor, Queue, QueueOptions, QueueScheduler, QueueSchedulerOptions, Worker } from "bullmq";
import * as dotenv from "dotenv";
import path from 'path';

export enum QueueType {
    SearchGame = "search-game",
    ResolveGame = "resolve-game",
    ResolveSource = "resolve-source",
}

export type QueueParams = {
    [QueueType.SearchGame]: { gameId: string },
    [QueueType.ResolveGame]: { gameId: string },
    [QueueType.ResolveSource]: { sourceId: string },
};

dotenv.config({ path: path.join(__dirname, "..", "..", "..", ".env") });

const QUEUE_CONNECTION_OPTIONS = {
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD
};

/**
 * TODO: Add error handlers!
 */
export const createWorkerForQueue = <T extends QueueType>(
    type: T,
    processor: Processor<QueueParams[T]>,
    options?: WorkerOptions
) => new Worker<QueueParams[T]>(
    type,
    processor,
    {
        connection: QUEUE_CONNECTION_OPTIONS,
        ...options,
    }
);

export const createSchedulerForQueue = <T extends QueueType>(
    type: T,
    options?: QueueSchedulerOptions
) => new QueueScheduler(
    type,
    {
        connection: QUEUE_CONNECTION_OPTIONS,
        ...options
    }
);

export const createQueue = (type: QueueType, options?: QueueOptions) =>
    new Queue(type, {
        connection: QUEUE_CONNECTION_OPTIONS,
        ...options,
        defaultJobOptions: {
            removeOnComplete: true,
            removeOnFail: true,
            // TODO: Not sure about that
            timeout: 60000,
            attempts: 2,
            backoff: {
                type: "exponential",
                delay: 1000
            }
        }
    });
