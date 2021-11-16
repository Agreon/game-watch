import { Game, InfoSource, mikroOrmConfig } from "@game-watch/database";
import { createWorkerForQueue, QueueType } from "@game-watch/queue";
import { EntityManager, MikroORM } from "@mikro-orm/core";
import { Worker } from "bullmq";

import { ResolveService } from "./resolve-service";
import { EpicResolver } from "./resolvers/epic-resolver";
import { MetacriticResolver } from "./resolvers/metacritic-resolver";
import { PsStoreResolver } from "./resolvers/ps-store-resolver";
import { SteamResolver } from "./resolvers/steam-resolver";
import { SwitchResolver } from "./resolvers/switch-resolver";

let worker: Worker | undefined;

const resolveService = new ResolveService([
    new SteamResolver(),
    new SwitchResolver(),
    new PsStoreResolver(),
    new EpicResolver(),
    new MetacriticResolver(),
]);

const resolveGame = async (
    { gameId, em }: { gameId: string, em: EntityManager }
) => {
    console.time("Resolve");

    const game = await em.findOneOrFail(Game, gameId, ["infoSources"]);
    const infoSources = await game.infoSources.loadItems();

    const resolvePromises = infoSources
        .filter(infoSource => !infoSource.disabled)
        .map(async source => {
            const resolvedGameData = await resolveService.resolveGameInformation(
                source.remoteGameId,
                source.type
            );
            if (!resolvedGameData) {
                source.resolveError = true;
                console.warn(`Source ${source.type} could not be resolved`);

                return;
            }

            source.resolveError = false;
            source.data = resolvedGameData;
            await em.persistAndFlush(source);
        });

    await Promise.all(resolvePromises);
    game.syncing = false;

    await em.persistAndFlush(game);

    console.timeEnd("Resolve");
};

const resolveSource = async (
    { sourceId, em }: { sourceId: string, em: EntityManager }
) => {
    const source = await em.findOneOrFail(InfoSource, sourceId);

    const resolvedGameData = await resolveService.resolveGameInformation(
        source.remoteGameId,
        source.type
    );
    if (!resolvedGameData) {
        source.resolveError = true;
        console.warn(`Source ${source.type} could not be resolved`);

        return;
    }

    source.data = resolvedGameData;
    source.resolveError = false;
    source.syncing = false;

    await em.persistAndFlush(source);
};


const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);

    worker = createWorkerForQueue(QueueType.ResolveGame, async ({ data: { gameId } }) => {
        await resolveGame({
            gameId,
            em: orm.em,
        });
    });

    // worker = new Worker<{ sourceId: string }>(
    //     "resolveSource",
    //     async ({ data: { sourceId } }) => {
    //         await resolveSource({
    //             sourceId,
    //             em: orm.em,
    //         });

    //     }, {
    //     connection: queueConnectionOptions,
    //     // TODO: env
    //     concurrency: 1
    // });

    console.log("Listening for events");
};

main().catch(error => {
    if (worker) {
        worker.close();
    }
    console.error(error);
    process.exit(1);
});