import { EntityRepository, QueryOrder } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { ResolveService } from "../resolve/resolve-service";
import { SearchService } from "../search/search-service";
import { Game } from "./game-model";
import { InfoSource, InfoSourceType } from "../info-source/info-source-model";

@Injectable()
export class GameService {
    private readonly logger = new Logger(GameService.name);

    public constructor(
        private readonly searchService: SearchService,
        private readonly resolveService: ResolveService,
        @InjectRepository(Game)
        private readonly gameRepository: EntityRepository<Game>,
        @InjectRepository(InfoSource)
        private readonly infoSourceRepository: EntityRepository<InfoSource>
    ) { }

    public async createGame(search: string) {
        let game = await this.gameRepository.findOne({ name: search });
        if (game !== null) {
            throw new ConflictException()
        }

        game = new Game({ name: search });
        await this.gameRepository.persistAndFlush(game);

        return game;
    }

    public async syncGame(gameId: string) {
        const game = await this.gameRepository.findOneOrFail(gameId, ["infoSources"]);

        return await this.syncGameInfoSources(game);
    }

    public async deleteGame(gameId: string) {
        const game = await this.gameRepository.findOneOrFail(gameId, ["infoSources"]);

        for (const source of game.infoSources) {
            this.infoSourceRepository.remove(source);
        }

        await this.gameRepository.removeAndFlush(game)
    }

    public async syncAllGames() {
        const games = await this.gameRepository.findAll(["infoSources"]);

        // TODO: use p-queue
        for (const game of games) {
            await this.syncGameInfoSources(game);
        }
    }

    private async syncGameInfoSources(game: Game) {
        this.logger.debug(`Syncing InfoSources for ${game.name} (${game.id})`)
        const existingInfoSources = await game.infoSources.loadItems();

        // Resolve for existing sources
        const resolvePromises = existingInfoSources
            .filter(infoSource => !infoSource.disabled)
            .map(
                async source => {
                    const resolvedGameData = await this.resolveService.resolveGameInformation(
                        source.remoteGameId,
                        source.type
                    );
                    if (!resolvedGameData) {
                        // TODO: disable or mark with warning?
                        // => data: null as warning?
                        this.logger.warn(`Source ${source.type} for game ${game.id} is not resolvable`)

                        return;
                    }

                    source.data = resolvedGameData;
                }
            );

        // Resolve for possible new sources
        const sourcesToSearch = Object.values(InfoSourceType).filter(
            (type => !existingInfoSources.map(({ type }) => type).includes(type))
        );
        const searchAndResolvePromises = sourcesToSearch.map(
            async sourceType => {
                const remoteGameId = await this.searchService.searchForGameInSource(game.name, sourceType);
                if (!remoteGameId) {
                    this.logger.debug(`No store game information found in '${sourceType}' for '${game.name}'`);
                    return null;
                }


                const resolvedGameData = await this.resolveService.resolveGameInformation(remoteGameId, sourceType);
                if (!resolvedGameData) {
                    return;
                }

                game.infoSources.add(new InfoSource({
                    type: sourceType,
                    remoteGameId: remoteGameId,
                    data: resolvedGameData,
                }));
            }
        );

        await Promise.all([...resolvePromises, ...searchAndResolvePromises]);

        await this.gameRepository.persistAndFlush(game);

        return game;
    }

    public async getGames() {
        return await this.gameRepository.findAll({
            populate: ["infoSources"],
            orderBy: {
                updatedAt: QueryOrder.DESC,
                infoSources: { type: QueryOrder.DESC },
            }
        })
    }
}