import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, Logger } from "@nestjs/common";
import { Game } from "../game/game-model";
import { ResolveService } from "../resolve/resolve-service";
import { InfoSource, InfoSourceType } from "./info-source-model";

@Injectable()
export class InfoSourceService {
    private readonly logger = new Logger(InfoSourceService.name);

    public constructor(
        private readonly resolveService: ResolveService,
        @InjectRepository(Game)
        private readonly gameRepository: EntityRepository<Game>,
        @InjectRepository(InfoSource)
        private readonly infoSourceRepository: EntityRepository<InfoSource>
    ) { }

    public async addInfoSource(gameId: string, type: InfoSourceType, remoteGameId: string) {
        const game = await this.gameRepository.findOneOrFail(gameId);

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

        const resolvedGameData = await this.resolveService.resolveGameInformation(
            infoSource.remoteGameId,
            infoSource.type
        );

        if (!resolvedGameData) {
            infoSource.resolveError = true;
            infoSource.data = null;
        } else {
            infoSource.data = resolvedGameData;
        }

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