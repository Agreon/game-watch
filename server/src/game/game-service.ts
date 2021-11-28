import { Game, InfoSource, Tag } from "@game-watch/database";
import { QueueType } from "@game-watch/queue";
import { QueryOrder } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import { ConflictException, Injectable } from "@nestjs/common";

import { QueueService } from "../queue/queue-service";

@Injectable()
export class GameService {
    public constructor(
        private readonly queueService: QueueService,
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

        await this.queueService.addToQueue(QueueType.SearchGame, { gameId: game.id });

        return game;
    }

    public async syncGame(gameId: string) {
        const game = await this.gameRepository.findOneOrFail(gameId, ["infoSources", "tags"]);

        game.syncing = true;
        await this.gameRepository.persistAndFlush(game);

        await this.queueService.addToQueue(QueueType.SearchGame, { gameId: game.id });

        return game;
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
            await this.queueService.removeRepeatableInfoSourceResolveJob(source);
            this.infoSourceRepository.remove(source);
        }

        await this.gameRepository.removeAndFlush(game);
    }

    public async getGame(gameId: string) {
        return await this.gameRepository.findOneOrFail(gameId, ["infoSources", "tags"]);
    }

    public async getGames({ withTags, withInfoSources }: { withTags?: string[], withInfoSources?: string[] }) {
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

        if (withTags) {
            const matchingTagsQuery = knex
                .count("tag_id")
                .from("game_tags")
                .where({
                    "game_id": knex.ref("game.id"),
                })
                .andWhere("tag_id", "IN", withTags);

            query
                .withSubQuery(matchingTagsQuery, "game.matchingTags")
                .andWhere({ 'game.matchingTags': { $gt: 0 } });
        }

        if (withInfoSources) {
            const matchingInfoSourcesSubQuery = knex
                .count("info_source.id")
                .from("info_source")
                .where({
                    "game_id": knex.ref("game.id"),
                    disabled: false
                })
                .andWhere("type", "in", withInfoSources);

            query
                .withSubQuery(matchingInfoSourcesSubQuery, "game.matchingInfoSources")
                .andWhere({ 'game.matchingInfoSources': { $gt: 0 } });
        }

        return await query.getResult();
    }
}