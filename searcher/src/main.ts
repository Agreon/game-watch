import { Game, InfoSource, mikroOrmConfig } from "@game-watch/database";
import { createQueue, createWorkerForQueue, QueueType } from "@game-watch/queue";
import { InfoSourceType } from "@game-watch/shared";
import { EntityManager, MikroORM } from "@mikro-orm/core";
import { Queue, Worker } from "bullmq";

import { SearchService } from "./search-service";
import { EpicSearcher } from "./searchers/epic-searcher";
import { MetacriticSearcher } from "./searchers/metacritic-searcher";
import { PsStoreSearcher } from "./searchers/ps-store-searcher";
import { SteamSearcher } from "./searchers/steam-searcher";
import { SwitchSearcher } from "./searchers/switch-searcher";

let worker: Worker | undefined;

const searchService = new SearchService([
    new EpicSearcher(),
    new MetacriticSearcher(),
    new PsStoreSearcher(),
    new SteamSearcher(),
    new SwitchSearcher()
]);

/**
 * TODO: think of nightly search as well!
 * TODO: How will the frontend look?
 *  => This should only use the resolveGame queue
 *      => resolveGameQueue sets syncing=false at the end
 */
const searchForGame = async (
    { gameId, em, resolveSourceQueue }: { gameId: string, em: EntityManager, resolveSourceQueue: Queue }
) => {
    console.time("Search");

    const game = await em.findOneOrFail(Game, gameId, ["infoSources"]);
    const existingInfoSources = await game.infoSources.loadItems();

    // Search possible new sources
    const sourcesToSearch = Object.values(InfoSourceType).filter(
        (type => !existingInfoSources.map(({ type }) => type).includes(type))
    );

    const searchPromises = sourcesToSearch.map(async sourceType => {
        const remoteGameId = await searchService.searchForGameInSource(game.search, sourceType);
        if (!remoteGameId) {
            console.debug(`No store game information found in '${sourceType}' for '${game.search}'`);
            return;
        }

        game.infoSources.add(new InfoSource({
            type: sourceType,
            remoteGameId,
        }));

    });

    await Promise.all(searchPromises);

    await em.persistAndFlush(game);

    // const updatedGame = await em.findOneOrFail(Game, gameId, ["infoSources"]);
    // const createdInfoSources = await updatedGame.infoSources.loadItems();

    // TODO: Timed at midnight
    // => But not all, otherwise we will get duplicates!
    // resolveSourceQueue.addBulk(
    //     createdInfoSources.map(source => ({
    //         name: "resolveGame",
    //         data: source.id
    //     }))
    // );

    console.timeEnd("Search");
};


const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);

    const resolveGameQueue = createQueue(QueueType.SearchGame);
    const resolveSourceQueue = createQueue(QueueType.ResolveSource);

    worker = createWorkerForQueue(QueueType.SearchGame, async (job) => {
        await searchForGame({
            gameId: job.data.gameId,
            em: orm.em,
            resolveSourceQueue
        });

        await resolveGameQueue.add("resolveGame", { gameId: job.data.gameId });
    });

    console.log("Listening for events");
};

main().catch(error => {
    if (worker) {
        worker.close();
    }
    console.error(error);
    process.exit(1);
});