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

    public async addInfoSource({ gameId, type, url, user }: CreateInfoSourceDto & { user: IdentifiedReference<User> }) {
        const game = await this.gameRepository.findOneOrFail(gameId);
        const remoteGameId = await this.mapperService.mapUrlToResolverId(url, type);

        // Reuse disabled or excluded info sources
        const existingInfoSource = await this.infoSourceRepository.findOne({
            type,
            game,
            user
        });
        let excludedRemoteGameIds: string[] = [];

        // TODO: Test
        if (existingInfoSource) {
            if ([InfoSourceState.Disabled, InfoSourceState.Initial].includes(existingInfoSource.state) === false) {
                throw new Error("NoNo TODO");
            }
            excludedRemoteGameIds = existingInfoSource.excludedRemoteGameIds;
            this.infoSourceRepository.remove(existingInfoSource);
        }

        const infoSource = new InfoSource<InfoSourceType, InfoSourceState>({
            type,
            user,
            state: InfoSourceState.Found,
            remoteGameId,
            // This field is only used for display on the initial search.
            // TODO => Improve: Just save id,fullName in data after search?
            remoteGameName: "",
            excludedRemoteGameIds,
            data: null
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

        infoSource.syncing = true;
        if (infoSource.state === InfoSourceState.Error) {
            infoSource.state = InfoSourceState.Found;
        }
        await this.infoSourceRepository.persistAndFlush(infoSource);

        await this.queueService.addToQueue(QueueType.ResolveSource, { sourceId: id, skipCache: true });

        return infoSource;
    }

    public async disableInfoSource(id: string) {
        const infoSource = await this.infoSourceRepository.findOneOrFail(id);
        await this.queueService.removeRepeatableInfoSourceResolveJob(infoSource);

        // We remove all notifications that were created for this version of the info source, so that on re-use
        // the same behavior as with a new source applies.
        await this.notificationRepository.nativeDelete({
            infoSource,
        });

        infoSource.state = InfoSourceState.Disabled;
        await this.infoSourceRepository.persistAndFlush(infoSource);

        return infoSource;
    }

    public async excludeInfoSource(id: string) {
        const infoSource = await this.infoSourceRepository.findOneOrFail(id);
        await this.queueService.removeRepeatableInfoSourceResolveJob(infoSource);

        // We remove unnecessary notifications that were created for this version of the info source
        await this.notificationRepository.nativeDelete({
            infoSource,
        });

        infoSource.excludedRemoteGameIds = [...infoSource.excludedRemoteGameIds, infoSource.getRemoteGameIdOrFail()];
        infoSource.data = null;
        infoSource.remoteGameId = null;
        infoSource.remoteGameName = null;
        infoSource.state = InfoSourceState.Initial;

        await this.infoSourceRepository.persistAndFlush(infoSource);

        return infoSource;
    }
}
