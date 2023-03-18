import { AnyGameData, parseStructure } from '@game-watch/shared';
import {
    JobsOptions,
    Processor,
    Queue,
    QueueOptions,
    QueueScheduler,
    QueueSchedulerOptions,
    Worker,
    WorkerOptions,
} from 'bullmq';

import { EnvironmentStructure } from './environment';

export enum QueueType {
    SearchGame = 'search-game',
    ResolveSource = 'resolve-source',
    DeleteUnfinishedGameAdds = 'delete-unfinished-game-adds',
    CreateNotifications = 'create-notifications',
}

export type QueueParams = {
    [QueueType.SearchGame]: {
        gameId: string
        triggeredManually?: boolean
    },
    [QueueType.ResolveSource]: {
        sourceId: string
        triggeredManually?: boolean
    },
    [QueueType.DeleteUnfinishedGameAdds]: {
        gameId: string
    },
    [QueueType.CreateNotifications]: {
        sourceId: string
        existingGameData: AnyGameData | null
        resolvedGameData: AnyGameData | null
    },
};

const {
    REDIS_HOST,
    REDIS_PASSWORD,
    REDIS_PORT,
} = parseStructure(EnvironmentStructure, process.env);

export const QUEUE_CONNECTION_OPTIONS = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD
};

export const DEFAULT_JOB_OPTIONS: JobsOptions = {
    removeOnComplete: true,
    removeOnFail: true,
};

export const NIGHTLY_JOB_OPTIONS: JobsOptions = {
    ...DEFAULT_JOB_OPTIONS,
    attempts: 8,
    backoff: {
        type: 'exponential',
        delay: 5000,
    },
};

export const MANUALLY_TRIGGERED_JOB_OPTIONS: JobsOptions = {
    ...DEFAULT_JOB_OPTIONS,
    attempts: 2,
    backoff: {
        type: 'fixed',
        delay: 5000,
    },
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
        // With the default retry settings a nightly job is taking 41 Minutes + execution time.
        // So 60 Minutes should be enough time for any worker to finish.
        lockDuration: 60 * 60 * 1000,
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

export const createQueueHandle = (type: QueueType, options?: QueueOptions) =>
    new Queue(type, {
        connection: QUEUE_CONNECTION_OPTIONS,
        defaultJobOptions: DEFAULT_JOB_OPTIONS,
        ...options,
    });
