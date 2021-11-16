import { QueueParams, QueueType } from "@game-watch/queue";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";

@Injectable()
export class QueueService {
    public constructor(
        private readonly queues: Record<QueueType, Queue>
    ) { }

    public async addToQueue<T extends QueueType>(type: T, payload: QueueParams[T]) {
        await this.queues[type].add(type, payload);
    }
}