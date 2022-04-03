import { Game, InfoSource } from "@game-watch/database";
import { QueueParams, QueueType } from "@game-watch/queue";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JobsOptions, Queue } from "bullmq";

import { Environment } from "../environment";

@Injectable()
export class QueueService {
    public constructor(
        private readonly queues: Record<QueueType, Queue>,
        private readonly configService: ConfigService<Environment, true>,
    ) { }

    public async addToQueue<T extends QueueType>(type: T, payload: QueueParams[T], opts?: JobsOptions) {
        await this.queues[type].add(type, payload, opts);
    }

    public async createRepeatableInfoSourceResolveJob(infoSource: InfoSource) {
        await this.queues[QueueType.ResolveSource].add(
            QueueType.ResolveSource,
            { sourceId: infoSource.id },
            {
                repeat: {
                    cron: this.configService.get("SYNC_SOURCES_AT")
                },
                jobId: infoSource.id,
                priority: 2
            }
        );
    }

    public async removeRepeatableInfoSourceResolveJob(infoSource: InfoSource) {
        await this.queues[QueueType.ResolveSource].removeRepeatableByKey(
            `${QueueType.ResolveSource}:${infoSource.id}:::${this.configService.get("SYNC_SOURCES_AT")}`
        );
    }

    public async createRepeatableGameSearchJob(game: Game) {
        await this.queues[QueueType.SearchGame].add(
            QueueType.ResolveGame,
            { gameId: game.id },
            {
                repeat: {
                    cron: this.configService.get("SYNC_SOURCES_AT")
                },
                jobId: game.id,
                priority: 2
            }
        );
    }

    public async removeRepeatableGameSearchJob(game: Game) {
        await this.queues[QueueType.SearchGame].removeRepeatableByKey(
            `${QueueType.SearchGame}:${game.id}:::${this.configService.get("SYNC_SOURCES_AT")}`
        );
    }
}
