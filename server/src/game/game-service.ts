import { Game, InfoSource, Notification, Tag } from "@game-watch/database";
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
        @InjectRepository(Notification)
        private readonly notificationRepository: EntityRepository<Notification>,
    ) { }

    public async createGame(search: string) {
        let game = await this.gameRepository.findOne({ search, setupCompleted: true });
        if (game !== null) {
            throw new ConflictException();
        }

        game = new Game({ search });
        await this.gameRepository.persistAndFlush(game);

        await this.queueService.addToQueue(QueueType.SearchGame, { gameId: game.id });
        await this.queueService.addToQueue(
            QueueType.DeleteUnfinishedGameAdds,
            { gameId: game.id },
            { delay: 1000 * 60 * 60 }
        );

        return game;
    }

    public async syncGame(gameId: string) {
        const game = await this.gameRepository.findOneOrFail(gameId, ["infoSources", "tags"]);

        game.syncing = true;
        await this.gameRepository.persistAndFlush(game);

        await this.queueService.addToQueue(QueueType.SearchGame, { gameId: game.id });

        return game;
    }

    public async setupGame(gameId: string, name: string) {
        const game = await this.gameRepository.findOneOrFail(gameId, ["infoSources", "tags"]);

        game.setupCompleted = true;
        game.name = name;
        await this.gameRepository.persistAndFlush(game);
        await this.queueService.createRepeatableGameSearchJob(game);

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
        const game = await this.gameRepository.findOneOrFail(gameId, ["infoSources", "notifications"]);

        for (const notification of game.notifications) {
            this.notificationRepository.remove(notification);
        }

        for (const source of game.infoSources) {
            await this.queueService.removeRepeatableInfoSourceResolveJob(source);
            this.infoSourceRepository.remove(source);
        }

        await this.queueService.removeRepeatableGameSearchJob(game);
        await this.gameRepository.removeAndFlush(game);
    }

    public async getGame(gameId: string) {
        return await this.gameRepository.findOneOrFail(
            gameId,
            ["infoSources", "tags"],
            {
                infoSources: {
                    createdAt: QueryOrder.ASC,
                    id: QueryOrder.ASC
                }
            });
    }

    public async getGames({ withTags, withInfoSources }: { withTags?: string[], withInfoSources?: string[] }) {
        const knex = this.infoSourceRepository.getKnex();

        const query = this.gameRepository.createQueryBuilder("game")
            .select("*")
            .where({ setupCompleted: true })
            .leftJoinAndSelect("game.tags", "tags")
            .leftJoinAndSelect("game.infoSources", "infoSources")
            .orderBy({
                createdAt: QueryOrder.DESC,
                infoSources: { createdAt: QueryOrder.DESC },
                tags: { updatedAt: QueryOrder.DESC },
            });

        if (withTags) {
            const matchingTagsQuery = knex
                .count("tag_id")
                .from("game_tags")
                .andWhere({
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
                .andWhere({
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