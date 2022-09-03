import { GameDataU } from "@game-watch/shared";
import { JobsOptions, Processor, Queue, QueueOptions, QueueScheduler, QueueSchedulerOptions, Worker, WorkerOptions } from "bullmq";

import { EnvironmentStructure } from "./environment";
import { parseEnvironment } from "./parse-environment";

export enum QueueType {
    SearchGame = "search-game",
    ResolveSource = "resolve-source",
    DeleteUnfinishedGameAdds = "delete-unfinished-game-adds",
    CreateNotifications = "create-notifications",
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
    [QueueType.CreateNotifications]: {
        sourceId: string
        existingGameData: GameDataU
        resolvedGameData: GameDataU | null
    },
};

const { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } = parseEnvironment(EnvironmentStructure, process.env);

export const QUEUE_CONNECTION_OPTIONS = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD
};

export const DEFAULT_JOB_OPTIONS: JobsOptions = {
    removeOnComplete: true,
    removeOnFail: true,
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
        // We only want to remove the lock if the worker is surely hanging.
        // The timeout of puppeteer is 10 seconds. The max timeout of p-retry is 30 seconds
        // while having max 5 retries. So 5 Minutes should be enough time for any worker to finish.
        lockDuration: 5 * 60 * 1000,
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
        defaultJobOptions: DEFAULT_JOB_OPTIONS,
        ...options,
    });
