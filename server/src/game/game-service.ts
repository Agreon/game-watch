import { QueryOrder } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import { ConflictException, Injectable, Logger } from "@nestjs/common";

import { InfoSource, InfoSourceType } from "../info-source/info-source-model";
import { ResolveService } from "../resolve/resolve-service";
import { SearchService } from "../search/search-service";
import { Tag } from "../tag/tag-model";
import { Game } from "./game-model";

@Injectable()
export class GameService {
    private readonly logger = new Logger(GameService.name);

    public constructor(
        private readonly searchService: SearchService,
        private readonly resolveService: ResolveService,
        @InjectRepository(Game)
        private readonly gameRepository: EntityRepository<Game>,
        @InjectRepository(InfoSource)
        private readonly infoSourceRepository: EntityRepository<InfoSource>,
        @InjectRepository(Tag)
        private readonly tagRepository: EntityRepository<Tag>,
    ) { }

    public async createGame(search: string) {
        let game = await this.gameRepository.findOne({ search });
        if (game !== null) {
            throw new ConflictException();
        }

        game = new Game({ search });
        await this.gameRepository.persistAndFlush(game);

        return game;
    }

    public async syncGame(gameId: string) {
        const game = await this.gameRepository.findOneOrFail(gameId, ["infoSources", "tags"]);

        return await this.syncGameInfoSources(game);
    }

    public async addTagToGame(gameId: string, tagId: string) {
        const game = await this.gameRepository.findOneOrFail(gameId, ["infoSources", "tags"]);
        const tag = await this.tagRepository.findOneOrFail(tagId);

        game.tags.add(tag);
        await this.gameRepository.persistAndFlush(game);

        return game;
    }

    public async removeTagFromGame(gameId: string, tagId: string) {
        const game = await this.gameRepository.findOneOrFail(gameId, ["infoSources", "tags"]);
        const tag = await this.tagRepository.findOneOrFail(tagId);

        game.tags.remove(tag);
        await this.gameRepository.persistAndFlush(game);

        return game;
    }


    public async updateGameName(gameId: string, name: string) {
        const game = await this.gameRepository.findOneOrFail(gameId, ["infoSources", "tags"]);

        game.name = name;
        await this.gameRepository.persistAndFlush(game);

        return game;
    }

    public async deleteGame(gameId: string) {
        const game = await this.gameRepository.findOneOrFail(gameId, ["infoSources"]);

        for (const source of game.infoSources) {
            this.infoSourceRepository.remove(source);
        }

        await this.gameRepository.removeAndFlush(game);
    }

    public async syncAllGames() {
        const games = await this.gameRepository.findAll(["infoSources"]);

        // TODO: use p-queue
        for (const game of games) {
            await this.syncGameInfoSources(game);
        }
    }

    private async syncGameInfoSources(game: Game) {
        this.logger.debug(`Syncing InfoSources for ${game.search} (${game.id})`);
        console.time("Sync");
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
                        source.resolveError = true;
                        this.logger.warn(`Source ${source.type} for game ${game.id} is not resolvable anymore`);

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
                const remoteGameId = await this.searchService.searchForGameInSource(game.search, sourceType);
                if (!remoteGameId) {
                    this.logger.debug(`No store game information found in '${sourceType}' for '${game.search}'`);
                    return null;
                }

                const resolvedGameData = await this.resolveService.resolveGameInformation(remoteGameId, sourceType);
                if (!resolvedGameData) {
                    this.logger.debug(`'${remoteGameId}' could not be resolved in '${sourceType}' for '${game.search}'`);

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

        console.timeEnd("Sync");
        return game;
    }

    public async getGames({ tags, infoSources }: { tags?: string[], infoSources?: string[] }) {
        const knex = this.infoSourceRepository.getKnex();

        const query = this.gameRepository.createQueryBuilder("game")
            .select("*")
            .leftJoinAndSelect("game.tags", "tags")
            .leftJoinAndSelect("game.infoSources", "infoSources")
            .orderBy({
                updatedAt: QueryOrder.DESC,
                infoSources: { type: QueryOrder.DESC },
                tags: { updatedAt: QueryOrder.DESC },
            });

        if (tags) {
            const matchingTagsQuery = knex
                .count("tag_id")
                .from("game_tags")
                .where({
                    "game_id": knex.ref("game.id"),
                })
                .andWhere("tag_id", "IN", tags);

            query
                .withSubQuery(matchingTagsQuery, "game.matchingTags")
                .andWhere({ 'game.matchingTags': { $gt: 0 } });
        }

        if (infoSources) {
            const matchingInfoSourcesSubQuery = knex
                .count("info_source.id")
                .from("info_source")
                .where({
                    "game_id": knex.ref("game.id"),
                    disabled: false
                })
                .andWhere("type", "in", infoSources);

            query
                .withSubQuery(matchingInfoSourcesSubQuery, "game.matchingInfoSources")
                .andWhere({ 'game.matchingInfoSources': { $gt: 0 } });
        }

        return await query.getResult();
    }
}