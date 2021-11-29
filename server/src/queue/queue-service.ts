import { Game, InfoSource } from "@game-watch/database";
import { createSchedulerForQueue, QueueParams, QueueType } from "@game-watch/queue";
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Queue, QueueScheduler } from "bullmq";

@Injectable()
export class QueueService implements OnModuleDestroy {
    private readonly queueSchedulers: QueueScheduler[] = [];

    public constructor(
        private readonly queues: Record<QueueType, Queue>
    ) {
        this.queueSchedulers = Object.keys(queues).map(
            queueType => createSchedulerForQueue(queueType as QueueType)
        );
    }

    public async addToQueue<T extends QueueType>(type: T, payload: QueueParams[T]) {
        await this.queues[type].add(type, payload);
    }

    public async createRepeatableInfoSourceResolveJob(infoSource: InfoSource) {
        await this.queues[QueueType.ResolveSource].add(
            QueueType.ResolveSource,
            { sourceId: infoSource.id },
            {
                repeat: {
                    cron: process.env.SYNC_SOURCES_AT
                },
                jobId: infoSource.id,
                priority: 2
            }
        );
    }

    public async removeRepeatableInfoSourceResolveJob(infoSource: InfoSource) {
        await this.queues[QueueType.ResolveSource].removeRepeatableByKey(
            `${QueueType.ResolveSource}:${infoSource.id}:::${process.env.SYNC_SOURCES_AT}`
        );
    }

    public async createRepeatableGameSearchJob(game: Game) {
        await this.queues[QueueType.SearchGame].add(
            QueueType.ResolveGame,
            { gameId: game.id },
            {
                repeat: {
                    cron: process.env.SYNC_SOURCES_AT
                },
                jobId: game.id,
                priority: 2
            }
        );
    }

    public async removeRepeatableGameSearchJob(game: Game) {
        await this.queues[QueueType.SearchGame].removeRepeatableByKey(
            `${QueueType.SearchGame}:${game.id}:::${process.env.SYNC_SOURCES_AT}`
        );
    }

    public async onModuleDestroy() {
        await Promise.all(this.queueSchedulers.map(
            async (scheduler) => await scheduler.close()
        ));
    }
}
