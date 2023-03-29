import { Game, InfoSource } from '@game-watch/database';
import { QueueParams, QueueType } from '@game-watch/queue';
import { getCronForNightlySync } from '@game-watch/service';
import { Injectable } from '@nestjs/common';
import { JobsOptions, Queue } from 'bullmq';

@Injectable()
export class QueueService {
    public constructor(
        private readonly queues: Record<QueueType, Queue>,
    ) { }

    public async addToQueue<T extends QueueType>(
        type: T,
        payload: QueueParams[T],
        options: JobsOptions,
    ) {
        await this.queues[type].add(type, payload, options);
    }

    public async createRepeatableInfoSourceResolveJob(infoSource: InfoSource) {
        await this.queues[QueueType.ResolveSource].add(
            QueueType.ResolveSource,
            { sourceId: infoSource.id },
            {
                repeat: { pattern: getCronForNightlySync(infoSource.country) },
                jobId: infoSource.id,
                priority: 2
            }
        );
    }

    public async removeRepeatableInfoSourceResolveJob({ id, country }: InfoSource) {
        await this.queues[QueueType.ResolveSource].removeRepeatableByKey(
            `${QueueType.ResolveSource}:${id}:::${getCronForNightlySync(country)}`
        );
    }

    public async createRepeatableGameSearchJob(game: Game, pattern: string) {
        await this.queues[QueueType.SearchGame].add(
            QueueType.SearchGame,
            { gameId: game.id },
            {
                repeat: { pattern },
                jobId: game.id,
                priority: 2
            }
        );
    }

    public async removeRepeatableGameSearchJob(game: Game, pattern: string) {
        await this.queues[QueueType.SearchGame].removeRepeatableByKey(
            `${QueueType.SearchGame}:${game.id}:::${pattern}`
        );
    }
}
