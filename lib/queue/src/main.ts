import { Processor, Queue, QueueOptions, QueueScheduler, QueueSchedulerOptions, Worker, WorkerOptions } from "bullmq";

import { EnvironmentStructure } from "./environment";
import { parseEnvironment } from "./parse-environment";

export enum QueueType {
    SearchGame = "search-game",
    ResolveSource = "resolve-source",
    DeleteUnfinishedGameAdds = "delete-unfinished-game-adds"
}

export type QueueParams = {
    [QueueType.SearchGame]: {
        gameId: string
        initialRun?: boolean
    },
    [QueueType.ResolveSource]: {
        sourceId: string
        initialRun?: boolean
        skipCache?: boolean
    },
    [QueueType.DeleteUnfinishedGameAdds]: { gameId: string },
};

const { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } = parseEnvironment(EnvironmentStructure, process.env);

const QUEUE_CONNECTION_OPTIONS = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD
};

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
    },
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
