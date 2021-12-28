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
            provide: QueueType.DeleteUnfinishedGameAdds,
            useFactory: () => createQueue(QueueType.DeleteUnfinishedGameAdds)
        },
        {
            provide: QueueService,
            useFactory: (
                searchGameQueue: Queue,
                resolveSourceQueue: Queue,
                resolveGameQueue: Queue,
                deleteUnfinishedGameAddsQueue: Queue,
            ) => new QueueService({
                [QueueType.SearchGame]: searchGameQueue,
                [QueueType.ResolveSource]: resolveSourceQueue,
                [QueueType.ResolveGame]: resolveGameQueue,
                [QueueType.DeleteUnfinishedGameAdds]: deleteUnfinishedGameAddsQueue
            }),
            inject: [QueueType.SearchGame, QueueType.ResolveSource, QueueType.ResolveGame, QueueType.DeleteUnfinishedGameAdds]
        },
    ],
    exports: [QueueService]
})
export class QueueModule { }
