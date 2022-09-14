import { Game, InfoSource } from "@game-watch/database";
import { QueueParams, QueueType } from "@game-watch/queue";
import { Logger } from "@game-watch/service";
import { InfoSourceState } from "@game-watch/shared";
import { EntityManager } from "@mikro-orm/core";
import { Queue } from "bullmq";

import { SearchService } from "./search-service";

interface Params {
    gameId: string
    initialRun?: boolean
    searchService: SearchService
    resolveSourceQueue: Queue<QueueParams[QueueType.ResolveSource]>
    em: EntityManager
    logger: Logger
}

export const searchForGame = async (
    { gameId, initialRun, searchService, em, logger, resolveSourceQueue }: Params
) => {
    const startTime = new Date().getTime();

    const game = await em.findOneOrFail(Game, gameId, { populate: ["infoSources", "user"] });
    const userCountry = game.user.get().country;
    const infoSources = game.infoSources.getItems();

    const sourcesToSearch = infoSources.filter(
        ({ state }) => state === InfoSourceState.Initial
    );

    logger.info(`Searching for ${JSON.stringify(sourcesToSearch.map(source => source.type))}`);

    await Promise.all(sourcesToSearch.map(async source => {
        logger.info(`Searching ${source.type} for '${game.search}'`);

        const searchResponse = await searchService.searchForGameInSource(
            game.search,
            source.type,
            { logger, userCountry, initialRun }
        );
        if (!searchResponse || source.excludedRemoteGameIds.includes(searchResponse.remoteGameId)) {
            logger.info(`No new store game information found in '${source.type}' for '${game.search}'`);
            return;
        }
        logger.info(`Found game information in ${source.type} for '${game.search}': '${searchResponse.remoteGameId}'`);

        source.state = InfoSourceState.Found;
        source.remoteGameId = searchResponse.remoteGameId;
        source.remoteGameName = searchResponse.remoteGameName;

        await em.nativeUpdate(InfoSource, source.id, {
            state: InfoSourceState.Found,
            remoteGameId: searchResponse.remoteGameId,
            remoteGameName: searchResponse.remoteGameName,
            updatedAt: new Date(),
            foundAt: new Date(),
        });

        await resolveSourceQueue.add(
            QueueType.ResolveSource,
            {
                sourceId: source.id,
                initialRun
            },
            {
                jobId: source.id,
                priority: 1
            }
        );

        await resolveSourceQueue.add(
            QueueType.ResolveSource,
            { sourceId: source.id },
            {
                repeat: {
                    cron: process.env.SYNC_SOURCES_AT
                },
                jobId: source.id,
                priority: 2
            }
        );
    }));

    // We already set syncing to false here to signal the AddGameModal that the search is done.
    // => TODO: Just check the current sources in the modal

    const duration = new Date().getTime() - startTime;
    logger.debug(`Searching for game took ${duration} ms`);
};
