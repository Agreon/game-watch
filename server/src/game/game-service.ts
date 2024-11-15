import { Game, InfoSource, Tag, User } from '@game-watch/database';
import { MANUALLY_TRIGGERED_JOB_OPTIONS, QueueType } from '@game-watch/queue';
import { getCronForNightlySync } from '@game-watch/service';
import { InfoSourceState, SetupGameDto } from '@game-watch/shared';
import { QueryOrder, Ref } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { QueueService } from '../queue/queue-service';

@Injectable()
export class GameService {
    public constructor(
        private readonly queueService: QueueService,
        private readonly entityManager: EntityManager,
    ) { }

    public async createGame(search: string, user: Ref<User>) {
        const game = new Game({ search, user });

        await this.entityManager.persistAndFlush(game);

        await this.queueService.addToQueue(
            QueueType.SearchGame,
            { gameId: game.id, triggeredManually: true },
            MANUALLY_TRIGGERED_JOB_OPTIONS
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
        const game = await this.entityManager.findOneOrFail(Game, id, { populate: ['infoSources'] });
        game.syncing = true;
        // We have to persist early here to avoid a race condition with the searcher setting the
        // syncing to false to early.
        await this.entityManager.persistAndFlush(game);

        await this.queueService.addToQueue(
            QueueType.SearchGame,
            { gameId: game.id, triggeredManually: true },
            MANUALLY_TRIGGERED_JOB_OPTIONS
        );

        const activeInfoSources = game.infoSources.getItems().filter(
            ({ state }) => state !== InfoSourceState.Disabled
        );

        for (const source of activeInfoSources) {
            source.state = InfoSourceState.Found;
            await this.queueService.addToQueue(
                QueueType.ResolveSource,
                { sourceId: source.id, triggeredManually: true },
                MANUALLY_TRIGGERED_JOB_OPTIONS
            );
        }

        await this.entityManager.persistAndFlush(game);

        return game;
    }

    public async setupGame(id: string, { name, continueSearching }: SetupGameDto) {
        const game = await this.entityManager.findOneOrFail(Game, id, { populate: ['user'] });

        game.setupCompleted = true;
        game.continueSearching = continueSearching;
        game.name = name;
        await this.entityManager.persistAndFlush(game);

        if (continueSearching) {
            await this.queueService.createRepeatableGameSearchJob(
                game,
                getCronForNightlySync(game.user.getEntity().country)
            );
        }

        return game;
    }

    public async addTagToGame(id: string, tag: Tag) {
        const game = await this.entityManager.findOneOrFail(Game, id, { populate: ['tags'] });

        game.tags.add(tag);
        await this.entityManager.persistAndFlush(game);

        return game;
    }

    public async removeTagFromGame(id: string, tag: Tag) {
        const game = await this.entityManager.findOneOrFail(Game, id, { populate: ['tags'] });

        game.tags.remove(tag);
        await this.entityManager.persistAndFlush(game);

        return game;
    }

    public async updateGameName(id: string, name: string) {
        const game = await this.entityManager.findOneOrFail(Game, id);

        game.name = name;
        await this.entityManager.persistAndFlush(game);

        return game;
    }

    public async deleteGame(id: string) {
        const game = await this.entityManager.findOneOrFail(
            Game,
            id,
            { populate: ['infoSources', 'user'] }
        );

        for (const source of game.infoSources) {
            await this.queueService.removeRepeatableInfoSourceResolveJob(source);
        }

        await this.queueService.removeRepeatableGameSearchJob(
            game,
            getCronForNightlySync(game.user.getEntity().country)
        );
        await this.entityManager.removeAndFlush(game);
    }

    public async getGame(id: string): Promise<Game & { infoSources: InfoSource[], tags: Tag[] }> {
        const game = await this.entityManager.createQueryBuilder(Game, 'game')
            .select('*')
            .leftJoinAndSelect('game.tags', 'tags')
            .leftJoinAndSelect('game.infoSources', 'infoSources')
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

    public async getGames(
        { withTags, withInfoSources, onlyAlreadyReleased, includeEarlyAccessGames, user, offset, limit }: {
            withTags?: string[];
            withInfoSources?: string[];
            onlyAlreadyReleased?: boolean;
            includeEarlyAccessGames?: boolean;
            offset?: number,
            limit?: number,
            user: Ref<User>;
        },
    ) {
        const knex = this.entityManager.getKnex();

        const query = this.entityManager.createQueryBuilder(Game, 'game')
            .select('*')
            .leftJoinAndSelect('game.tags', 'tags')
            .leftJoinAndSelect(
                'game.infoSources',
                'infoSources',
            )
            .where({
                $and: [
                    { user },
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
                createdAt: QueryOrder.DESC,
                infoSources: { createdAt: QueryOrder.DESC },
                tags: { createdAt: QueryOrder.DESC },
            });

        if (withTags) {
            const matchingTagsQuery = knex
                .count('tag_id')
                .from('game_tags')
                .andWhere({ 'game_id': knex.ref('game.id'), })
                .andWhere('tag_id', 'IN', withTags);

            query
                .withSubQuery(matchingTagsQuery, 'game.matchingTags')
                .andWhere({ 'game.matchingTags': { $gt: 0 } });
        }

        if (withInfoSources) {
            const matchingInfoSourcesSubQuery = knex
                .count('info_source.id')
                .from('info_source')
                .andWhere({ 'game_id': knex.ref('game.id'), })
                .andWhereNot('state', InfoSourceState.Disabled)
                .andWhere('type', 'in', withInfoSources);

            query
                .withSubQuery(matchingInfoSourcesSubQuery, 'game.matchingInfoSources')
                .andWhere({ 'game.matchingInfoSources': { $gt: 0 } });
        }

        if (onlyAlreadyReleased) {
            const releasedSourcesQuery = knex
                .count('info_source.id')
                .from('info_source')
                .where({ 'game_id': knex.ref('game.id'), })
                .andWhereNot('state', InfoSourceState.Disabled)
                .andWhereRaw("data -> 'releaseDate' @> '{\"isExact\": true}'")
                .andWhereRaw("date(data -> 'releaseDate' ->> 'date') < NOW()");

            if (withInfoSources) {
                releasedSourcesQuery.andWhere('type', 'in', withInfoSources);
            }

            if (!includeEarlyAccessGames) {
                releasedSourcesQuery.andWhereRaw("data @> '{\"isEarlyAccess\": true}' = false");
            }

            query
                .withSubQuery(releasedSourcesQuery, 'game.releasedInSources')
                .andWhere({ 'game.releasedInSources': { $gt: 0 } });
        }

        if (limit) {
            query.limit(limit, offset);
        }

        const result = await query.getResult();

        return result.map((game) => ({
            ...game.toObject(),
            infoSources: game.infoSources.toArray(),
            tags: game.tags.toArray(),
        }));
    }
}
