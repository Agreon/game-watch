import { Game, InfoSource, Notification, Tag, User } from "@game-watch/database";
import { QueueType } from "@game-watch/queue";
import { InfoSourceState } from "@game-watch/shared";
import { IdentifiedReference, QueryOrder } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import { ConflictException, Injectable } from "@nestjs/common";

import { QueueService } from "../queue/queue-service";

@Injectable()
export class GameService {
    public constructor(
        private readonly queueService: QueueService,
        @InjectRepository(User)
        private readonly userRepository: EntityRepository<User>,
        @InjectRepository(Game)
        private readonly gameRepository: EntityRepository<Game>,
        @InjectRepository(InfoSource)
        private readonly infoSourceRepository: EntityRepository<InfoSource>,
        @InjectRepository(Notification)
        private readonly notificationRepository: EntityRepository<Notification>,
    ) { }

    public async createGame(search: string, userRef: IdentifiedReference<User>) {
        const user = await this.userRepository.findOneOrFail(userRef);

        const existingGame = await this.gameRepository.findOne({ search, setupCompleted: true, user });
        if (existingGame !== null) {
            throw new ConflictException();
        }

        const game = new Game({ search, user: userRef });

        await this.gameRepository.persistAndFlush(game);

        await this.queueService.addToQueue(
            QueueType.SearchGame,
            { gameId: game.id, initialRun: true }
        );
        await this.queueService.addToQueue(
            QueueType.DeleteUnfinishedGameAdds,
            { gameId: game.id },
            // 1 hour
            { delay: 1000 * 60 * 60 }
        );

        return game;
    }

    public async syncGame(id: string) {
        const game = await this.gameRepository.findOneOrFail(id, { populate: ["infoSources"] });
        game.syncing = true;
        // We have to persist early here to avoid a race condition with the resolver setting the
        // syncing to false to early.
        await this.gameRepository.persistAndFlush(game);

        await this.queueService.addToQueue(QueueType.SearchGame, { gameId: game.id });

        const activeInfoSources = game.infoSources.getItems().filter(
            ({ state }) => state !== InfoSourceState.Disabled
        );

        for (const source of activeInfoSources) {
            // TODO: Is this persisted?
            source.state = InfoSourceState.Found;
            await this.queueService.addToQueue(
                QueueType.ResolveSource,
                { sourceId: source.id, skipCache: true }
            );
        }

        await this.gameRepository.persistAndFlush(game);

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
        const game = await this.gameRepository.createQueryBuilder("game")
            .select("*")
            .leftJoinAndSelect("game.tags", "tags")
            .leftJoinAndSelect("game.infoSources", "infoSources")
            .where({
                $and: [
                    { id },
                    {
                        $or: [
                            {
                                infoSources: {
                                    state: { $ne: InfoSourceState.Disabled },
                                }
                            },
                            {
                                setupCompleted: false
                            }
                        ]
                    }]
            })
            .orderBy({
                infoSources: { createdAt: QueryOrder.DESC, id: QueryOrder.ASC },
                tags: { createdAt: QueryOrder.DESC },
            })
            .getSingleResult();

        return game as Game & { infoSources: InfoSource[], tags: Tag[] };
    }

    public async getGames({ withTags, withInfoSources, user }: { withTags?: string[], withInfoSources?: string[], user: IdentifiedReference<User> }) {
        const knex = this.infoSourceRepository.getKnex();

        const query = this.gameRepository.createQueryBuilder("game")
            .select("*")
            .where({ setupCompleted: true, user })
            .leftJoinAndSelect("game.tags", "tags")
            .leftJoinAndSelect("game.infoSources", "infoSources")
            .andWhere({
                infoSources: {
                    state: { $ne: InfoSourceState.Disabled },
                }
            })
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
                    state: { $ne: InfoSourceState.Disabled },
                })
                .andWhere("type", "in", withInfoSources);

            query
                .withSubQuery(matchingInfoSourcesSubQuery, "game.matchingInfoSources")
                .andWhere({ 'game.matchingInfoSources': { $gt: 0 } });
        }

        return await query.getResult() as Array<Game & { infoSources: InfoSource[], tags: Tag[] }>;
    }
}
