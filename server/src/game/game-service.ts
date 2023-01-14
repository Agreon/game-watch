import { Game, InfoSource, Tag, User } from '@game-watch/database';
import { MANUALLY_TRIGGERED_JOB_OPTIONS, QueueType } from '@game-watch/queue';
import { getCronForNightlySync } from '@game-watch/service';
import { InfoSourceState, SetupGameDto } from '@game-watch/shared';
import { IdentifiedReference, QueryOrder } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { QueueService } from '../queue/queue-service';

@Injectable()
export class GameService {
    public constructor(
        private readonly queueService: QueueService,
        @InjectRepository(Game)
        private readonly gameRepository: EntityRepository<Game>,
        @InjectRepository(InfoSource)
        private readonly infoSourceRepository: EntityRepository<InfoSource>,
    ) { }

    public async createGame(search: string, user: IdentifiedReference<User>) {
        const game = new Game({ search, user });

        await this.gameRepository.persistAndFlush(game);

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
        const game = await this.gameRepository.findOneOrFail(id, { populate: ['infoSources'] });
        game.syncing = true;
        // We have to persist early here to avoid a race condition with the searcher setting the
        // syncing to false to early.
        await this.gameRepository.persistAndFlush(game);

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

        await this.gameRepository.persistAndFlush(game);

        return game;
    }

    public async setupGame(id: string, { name, continueSearching }: SetupGameDto) {
        const game = await this.gameRepository.findOneOrFail(id, { populate: ['user'] });

        game.setupCompleted = true;
        game.continueSearching = continueSearching;
        game.name = name;
        await this.gameRepository.persistAndFlush(game);

        if (continueSearching) {
            await this.queueService.createRepeatableGameSearchJob(
                game,
                getCronForNightlySync(game.user.getEntity().country)
            );
        }

        return game;
    }

    public async addTagToGame(id: string, tag: Tag) {
        const game = await this.gameRepository.findOneOrFail(id, { populate: ['tags'] });

        game.tags.add(tag);
        await this.gameRepository.persistAndFlush(game);

        return game;
    }

    public async removeTagFromGame(id: string, tag: Tag) {
        const game = await this.gameRepository.findOneOrFail(id, { populate: ['tags'] });

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
        const game = await this.gameRepository.findOneOrFail(
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
        await this.gameRepository.removeAndFlush(game);
    }

    public async getGame(id: string): Promise<Game & { infoSources: InfoSource[], tags: Tag[] }> {
        const game = await this.gameRepository.createQueryBuilder('game')
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
        { withTags, withInfoSources, user }: {
            withTags?: string[];
            withInfoSources?: string[];
            user: IdentifiedReference<User>;
        },
    ) {
        const knex = this.infoSourceRepository.getKnex();

        const query = this.gameRepository.createQueryBuilder('game')
            .select('*')
            .where({ setupCompleted: true, user })
            .leftJoinAndSelect('game.tags', 'tags')
            .leftJoinAndSelect('game.infoSources', 'infoSources')
            .orderBy({
                createdAt: QueryOrder.DESC,
                infoSources: { createdAt: QueryOrder.DESC },
                tags: { createdAt: QueryOrder.DESC },
            });

        if (withTags) {
            const matchingTagsQuery = knex
                .count('tag_id')
                .from('game_tags')
                .andWhere({
                    'game_id': knex.ref('game.id'),
                })
                .andWhere('tag_id', 'IN', withTags);

            query
                .withSubQuery(matchingTagsQuery, 'game.matchingTags')
                .andWhere({ 'game.matchingTags': { $gt: 0 } });
        }

        if (withInfoSources) {
            const matchingInfoSourcesSubQuery = knex
                .count('info_source.id')
                .from('info_source')
                .andWhere({
                    'game_id': knex.ref('game.id'),
                })
                .andWhereNot('state', InfoSourceState.Disabled)
                .andWhere('type', 'in', withInfoSources);

            query
                .withSubQuery(matchingInfoSourcesSubQuery, 'game.matchingInfoSources')
                .andWhere({ 'game.matchingInfoSources': { $gt: 0 } });
        }

        return await query.getResult() as Array<Game & { infoSources: InfoSource[], tags: Tag[] }>;
    }
}
