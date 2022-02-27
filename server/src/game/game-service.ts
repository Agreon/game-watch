import { Game, InfoSource, Notification, Tag, User } from "@game-watch/database";
import { QueueType } from "@game-watch/queue";
import { IdentifiedReference, QueryOrder } from "@mikro-orm/core";
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
        @InjectRepository(Notification)
        private readonly notificationRepository: EntityRepository<Notification>,
    ) { }

    public async createGame(search: string, user: IdentifiedReference<User>) {
        let game = await this.gameRepository.findOne({ search, setupCompleted: true, user });
        if (game !== null) {
            throw new ConflictException();
        }

        game = new Game({ search, user });
        await this.gameRepository.persistAndFlush(game);

        await this.queueService.addToQueue(QueueType.SearchGame, { gameId: game.id, initialRun: true });
        await this.queueService.addToQueue(
            QueueType.DeleteUnfinishedGameAdds,
            { gameId: game.id },
            { delay: 1000 * 60 * 60 }
        );

        return game;
    }

    public async syncGame(id: string) {
        const game = await this.gameRepository.findOneOrFail(id);

        game.syncing = true;
        await this.gameRepository.persistAndFlush(game);

        await this.queueService.addToQueue(QueueType.SearchGame, { gameId: game.id });

        return game;
    }

    public async setupGame(id: string, name: string) {
        const game = await this.gameRepository.findOneOrFail(id);

        game.setupCompleted = true;
        game.name = name;
        await this.gameRepository.persistAndFlush(game);

        await this.queueService.createRepeatableGameSearchJob(game);

        return game;
    }

    public async addTagToGame(id: string, tag: Tag) {
        const game = await this.gameRepository.findOneOrFail(id, { populate: ["tags"] });

        game.tags.add(tag);
        await this.gameRepository.persistAndFlush(game);

        return game;
    }

    public async removeTagFromGame(id: string, tag: Tag) {
        const game = await this.gameRepository.findOneOrFail(id, { populate: ["tags"] });

        game.tags.remove(tag);
        await this.gameRepository.persistAndFlush(game);

        return game;
    }


    public async updateGameName(id: string, name: string) {
        const game = await this.gameRepository.findOneOrFail(id);

        game.name = name;
        await this.gameRepository.persistAndFlush(game);

        return game;
    }

    public async deleteGame(id: string) {
        const game = await this.gameRepository.findOneOrFail(id, { populate: ["infoSources", "notifications"] });

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

    public async getGame(id: string): Promise<Game & { infoSources: InfoSource[], tags: Tag[] }> {
        const game = await this.gameRepository.findOneOrFail(
            id,
            {
                populate: ["infoSources", "tags"],
                orderBy: {
                    infoSources: {
                        createdAt: QueryOrder.ASC,
                        id: QueryOrder.ASC
                    },
                    tags: {
                        createdAt: QueryOrder.DESC
                    }
                }
            }
        );

        // TODO: Uncool
        return game as unknown as Game & { infoSources: InfoSource[], tags: Tag[] };
    }

    // https://mikro-orm.io/docs/collections#filtering-collections?
    public async getGames({ withTags, withInfoSources, user }: { withTags?: string[], withInfoSources?: string[], user: IdentifiedReference<User> }) {
        const knex = this.infoSourceRepository.getKnex();

        // TODO: Exclude disabled and gameId = null sources
        const query = this.gameRepository.createQueryBuilder("game")
            .select("*")
            .where({ setupCompleted: true, user })
            .leftJoinAndSelect("game.tags", "tags")
            .leftJoinAndSelect("game.infoSources", "infoSources")
            .orderBy({
                createdAt: QueryOrder.DESC,
                infoSources: { createdAt: QueryOrder.DESC },
                tags: { createdAt: QueryOrder.DESC },
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
                    disabled: false,
                })
                .andWhereNot("remote_game_id", null)
                .andWhere("type", "in", withInfoSources);

            query
                .withSubQuery(matchingInfoSourcesSubQuery, "game.matchingInfoSources")
                .andWhere({ 'game.matchingInfoSources': { $gt: 0 } });
        }

        return await query.getResult() as Array<Game & { infoSources: InfoSource[], tags: Tag[] }>;
    }
}
