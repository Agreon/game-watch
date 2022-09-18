import { Game, InfoSource, Notification, User } from "@game-watch/database";
import { QueueType } from "@game-watch/queue";
import { CreateInfoSourceDto, InfoSourceState, InfoSourceType } from "@game-watch/shared";
import { EntityRepository, IdentifiedReference } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";

import { MapperService } from "../mapper/mapper-service";
import { QueueService } from "../queue/queue-service";

@Injectable()
export class InfoSourceService {
    public constructor(
        private readonly mapperService: MapperService,
        private readonly queueService: QueueService,
        @InjectRepository(Game)
        private readonly gameRepository: EntityRepository<Game>,
        @InjectRepository(InfoSource)
        private readonly infoSourceRepository: EntityRepository<InfoSource>,
        @InjectRepository(Notification)
        private readonly notificationRepository: EntityRepository<Notification>
    ) { }

    public async addInfoSource(
        { gameId, type, url, user }: CreateInfoSourceDto & { user: IdentifiedReference<User> }
    ) {
        const game = await this.gameRepository.findOneOrFail(gameId);
        const remoteGameId = await this.mapperService.mapUrlToResolverId(url, type);

        const existingInfoSource = await this.infoSourceRepository.findOne({
            game,
            type,
            state: InfoSourceState.Disabled
        });
        if (existingInfoSource) {
            await this.infoSourceRepository.removeAndFlush(existingInfoSource);
        }

        const infoSource = new InfoSource<InfoSourceType, InfoSourceState>({
            type,
            user,
            state: InfoSourceState.Found,
            data: {
                id: remoteGameId,
                // This field is only used for display on the initial search.
                // It is later overwritten by the resolvers.
                fullName: "Sync in progress",
                url,
            }
        });

        game.infoSources.add(infoSource);

        await this.gameRepository.persistAndFlush(game);

        await this.queueService.addToQueue(
            QueueType.ResolveSource,
            { sourceId: infoSource.id, initialRun: true }
        );
        await this.queueService.createRepeatableInfoSourceResolveJob(infoSource);

        return infoSource;
    }

    public async getInfoSource(id: string) {
        return await this.infoSourceRepository.findOneOrFail(id);
    }

    public async syncInfoSource(id: string) {
        const infoSource = await this.infoSourceRepository.findOneOrFail(id);

        infoSource.state = InfoSourceState.Found;
        await this.infoSourceRepository.persistAndFlush(infoSource);

        await this.queueService.addToQueue(
            QueueType.ResolveSource,
            { sourceId: id, skipCache: true }
        );

        return infoSource;
    }

    public async disableInfoSource(id: string, continueSearching: boolean) {
        const infoSource = await this.infoSourceRepository.findOneOrFail(id);

        await this.queueService.removeRepeatableInfoSourceResolveJob(infoSource);

        // We remove all notifications that were created for this version of the info source,
        // so that on re-use the same behavior as with a new source applies.
        await this.notificationRepository.nativeDelete({ infoSource });

        infoSource.continueSearching = continueSearching;
        infoSource.excludedRemoteGameIds = [
            ...infoSource.excludedRemoteGameIds,
            infoSource.getDataOrFail().id
        ];
        infoSource.state = InfoSourceState.Disabled;
        await this.infoSourceRepository.persistAndFlush(infoSource);

        return infoSource;
    }
}
