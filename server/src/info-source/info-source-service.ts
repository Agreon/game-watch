import { Game, InfoSource } from "@game-watch/database";
import { QueueType } from "@game-watch/queue";
import { InfoSourceType } from "@game-watch/shared";
import { EntityRepository } from "@mikro-orm/core";
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
        private readonly infoSourceRepository: EntityRepository<InfoSource>
    ) { }

    public async addInfoSource(gameId: string, type: InfoSourceType, url: string) {
        const game = await this.gameRepository.findOneOrFail(gameId);
        const remoteGameId = await this.mapperService.mapUrlToResolverId(url, type);

        // Reuse disabled info sources
        const existingInfoSource = await this.infoSourceRepository.findOne({
            type,
            game
        });
        if (existingInfoSource) {
            existingInfoSource.disabled = false;
            existingInfoSource.data = null;
            existingInfoSource.resolveError = false;
            existingInfoSource.syncing = true;
            existingInfoSource.remoteGameId = remoteGameId;

            await this.infoSourceRepository.persistAndFlush(existingInfoSource);

            await this.queueService.addToQueue(QueueType.ResolveSource, { sourceId: existingInfoSource.id });
            await this.queueService.createRepeatableInfoSourceResolveJob(existingInfoSource);

            return existingInfoSource;
        }

        const infoSource = new InfoSource({
            type,
            remoteGameId,
            // This field is only used for display on the initial search.
            remoteGameName: "",
        });

        game.infoSources.add(infoSource);

        await this.gameRepository.persistAndFlush(game);

        await this.queueService.addToQueue(QueueType.ResolveSource, { sourceId: infoSource.id });
        await this.queueService.createRepeatableInfoSourceResolveJob(infoSource);

        return infoSource;
    }

    public async getInfoSource(id: string) {
        return await this.infoSourceRepository.findOneOrFail(id);
    }

    public async syncInfoSource(id: string) {
        const infoSource = await this.infoSourceRepository.findOneOrFail(id);

        await this.queueService.addToQueue(QueueType.ResolveSource, { sourceId: id });

        infoSource.syncing = true;
        await this.infoSourceRepository.persistAndFlush(infoSource);

        return infoSource;
    }

    public async disableInfoSource(id: string) {
        const infoSource = await this.infoSourceRepository.findOneOrFail(id);
        await this.queueService.removeRepeatableInfoSourceResolveJob(infoSource);

        infoSource.disabled = true;
        await this.infoSourceRepository.persistAndFlush(infoSource);

        return infoSource;
    }
}
