import { Game, InfoSource, Notification, User } from '@game-watch/database';
import { MANUALLY_TRIGGERED_JOB_OPTIONS, QueueType } from '@game-watch/queue';
import { CreateInfoSourceDto, InfoSourceState, InfoSourceType } from '@game-watch/shared';
import { Ref } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { MapperService } from '../mapper/mapper-service';
import { QueueService } from '../queue/queue-service';

@Injectable()
export class InfoSourceService {
    public constructor(
        private readonly mapperService: MapperService,
        private readonly queueService: QueueService,
        private readonly entityManager: EntityManager,
    ) { }

    public async addInfoSource(
        {
            gameId,
            type,
            url,
            user: userRef,
        }: CreateInfoSourceDto & { user: Ref<User> }
    ) {
        const user = await userRef.loadOrFail();
        const game = await this.entityManager.findOneOrFail(Game, gameId);
        const remoteGameId = await this.mapperService.mapUrlToResolverId(url, type, user.country);

        const existingInfoSource = await this.entityManager.findOne(InfoSource, {
            game,
            type,
            state: InfoSourceState.Disabled
        });
        if (existingInfoSource) {
            await this.entityManager.removeAndFlush(existingInfoSource);
        }

        const infoSource = new InfoSource<InfoSourceType, InfoSourceState>({
            type,
            user: userRef,
            state: InfoSourceState.Found,
            data: {
                id: remoteGameId,
                // This field is only used for display on the initial search.
                // It is later overwritten by the resolvers.
                fullName: 'Sync in progress',
                url,
            },
            country: user.country,
        });

        game.infoSources.add(infoSource);

        await this.entityManager.persistAndFlush(game);

        await this.queueService.addToQueue(
            QueueType.ResolveSource,
            { sourceId: infoSource.id, triggeredManually: true },
            MANUALLY_TRIGGERED_JOB_OPTIONS,
        );
        await this.queueService.createRepeatableInfoSourceResolveJob(infoSource);

        return infoSource;
    }

    public async getInfoSource(id: string) {
        return await this.entityManager.findOneOrFail(InfoSource, id);
    }

    public async syncInfoSource(id: string) {
        const infoSource = await this.entityManager.findOneOrFail(InfoSource, id);

        infoSource.state = InfoSourceState.Found;
        await this.entityManager.persistAndFlush(infoSource);

        await this.queueService.addToQueue(
            QueueType.ResolveSource,
            { sourceId: id, triggeredManually: true },
            MANUALLY_TRIGGERED_JOB_OPTIONS,
        );

        return infoSource;
    }

    public async disableInfoSource(id: string, continueSearching: boolean) {
        const infoSource = await this.entityManager.findOneOrFail(InfoSource, id);

        await this.queueService.removeRepeatableInfoSourceResolveJob(infoSource);

        // We remove all notifications that were created for this version of the info source,
        // so that on re-use the same behavior as with a new source applies.
        await this.entityManager.nativeDelete(Notification, { infoSource });

        infoSource.continueSearching = continueSearching;
        infoSource.excludedRemoteGameIds = [
            ...infoSource.excludedRemoteGameIds,
            infoSource.getDataOrFail().id
        ];
        infoSource.state = InfoSourceState.Disabled;
        await this.entityManager.persistAndFlush(infoSource);

        return infoSource;
    }
}
