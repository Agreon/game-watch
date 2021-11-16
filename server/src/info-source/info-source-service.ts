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
            existingInfoSource.remoteGameId = remoteGameId;

            await this.infoSourceRepository.persistAndFlush(existingInfoSource);

            return existingInfoSource;
        }


        const infoSource = new InfoSource({
            type,
            remoteGameId
        });

        game.infoSources.add(infoSource);

        await this.gameRepository.persistAndFlush(game);

        return infoSource;
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
        infoSource.disabled = true;
        await this.infoSourceRepository.persistAndFlush(infoSource);

        return infoSource;
    }
}