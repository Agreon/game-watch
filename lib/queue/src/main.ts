import { Processor, Queue, QueueOptions, Worker } from "bullmq";
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

const getQueueConnectionOptions = () => ({
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD
});

export const createWorkerForQueue = <T extends QueueType>(
    type: T,
    processor: Processor<QueueParams[T]>,
    options?: WorkerOptions
) => new Worker<QueueParams[T]>(
    type,
    processor,
    {
        connection: getQueueConnectionOptions(),
        ...options
    }
);

export const createQueue = (type: QueueType, options?: QueueOptions) =>
    new Queue(type, {
        connection: getQueueConnectionOptions(),
        ...options
    });