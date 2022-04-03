import { QueueType } from "@game-watch/queue";
import { BullModule, getQueueToken } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Queue } from "bullmq";

import { Environment } from "../environment";
import { QueueService } from "./queue-service";

@Module({
    imports: [
        BullModule.registerQueue(
            { name: QueueType.SearchGame, },
            { name: QueueType.ResolveSource },
            { name: QueueType.DeleteUnfinishedGameAdds, }
        )
    ],
    providers: [
        {
            provide: QueueService,
            useFactory: (
                searchGameQueue: Queue,
                resolveSourceQueue: Queue,
                deleteUnfinishedGameAddsQueue: Queue,
                configService: ConfigService<Environment, true>
            ) => new QueueService({
                [QueueType.SearchGame]: searchGameQueue,
                [QueueType.ResolveSource]: resolveSourceQueue,
                [QueueType.DeleteUnfinishedGameAdds]: deleteUnfinishedGameAddsQueue
            }, configService),
            inject: [
                getQueueToken(QueueType.SearchGame),
                getQueueToken(QueueType.ResolveSource),
                getQueueToken(QueueType.DeleteUnfinishedGameAdds),
                ConfigService
            ]
        },
    ],
    exports: [QueueService]
})
export class QueueModule { }
