import { createQueue, QueueType } from "@game-watch/queue";
import { Module } from "@nestjs/common";
import type { Queue } from "bullmq";

import { QueueService } from "./queue-service";

@Module({
    providers: [
        {
            provide: QueueType.SearchGame,
            useFactory: () => createQueue(QueueType.SearchGame)
        },
        {
            provide: QueueType.ResolveSource,
            useFactory: () => createQueue(QueueType.ResolveSource)
        },
        {
            provide: QueueType.ResolveGame,
            useFactory: () => createQueue(QueueType.ResolveGame)
        },
        {
            provide: QueueService,
            useFactory: (
                searchGameQueue: Queue,
                resolveSourceQueue: Queue,
                resolveGameQueue: Queue
            ) => new QueueService({
                [QueueType.SearchGame]: searchGameQueue,
                [QueueType.ResolveSource]: resolveSourceQueue,
                [QueueType.ResolveGame]: resolveGameQueue,
            }),
            inject: [QueueType.SearchGame, QueueType.ResolveSource, QueueType.ResolveGame]
        },
    ],
    exports: [QueueService]
})
export class QueueModule { }
