import { QueueParams, QueueType } from '@game-watch/queue';
import { CreateRequestContext,MikroORM } from '@mikro-orm/core';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Job } from 'bullmq';

import { GameService } from '../../game/game-service';

@Processor({ name: QueueType.DeleteUnfinishedGameAdds })
export class DeleteUnfinishedGameProcessor extends WorkerHost {
    private readonly logger = new Logger(DeleteUnfinishedGameProcessor.name);

    public constructor(
        // This is needed for @UseRequestContext to work properly
        private readonly orm: MikroORM,
        private readonly gameService: GameService,
    ) {
        super();
    }

    public async process(
        { data: { gameId } }: Job<QueueParams[QueueType.DeleteUnfinishedGameAdds]>
    ): Promise<void> {
        try {
            await this.deleteUnfinishedGame(gameId);
        } catch (error) {
            // Need to wrap this because otherwise the error is swallowed by the worker.
            this.logger.error(error);
            Sentry.captureException(error, { tags: { gameId } });
            throw error;
        }
    }

    @CreateRequestContext()
    public async deleteUnfinishedGame(id: string) {
        const gameToDelete = await this.gameService.getGame(id);
        if (!gameToDelete || gameToDelete.setupCompleted) {
            return;
        }

        this.logger.log(`Deleting unfinished game '${gameToDelete.id}'`);
        await this.gameService.deleteGame(gameToDelete.id);
    }
}
