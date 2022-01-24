import { Game, mikroOrmConfig } from "@game-watch/database";
import { createQueue, QueueType } from "@game-watch/queue";
import { parseEnvironment } from "@game-watch/service";
import { MikroORM } from "@mikro-orm/core";

import { EnvironmentStructure } from "../src/environment";

const { SYNC_SOURCES_AT } = parseEnvironment(EnvironmentStructure, process.env);

const main = async () => {
    const queue = createQueue(QueueType.SearchGame);

    const orm = await MikroORM.init(mikroOrmConfig);
    const games = await orm.em.find(Game, {});

    for (const game of games) {
        console.log("Adding cron for", game.id);

        queue.add(
            QueueType.SearchGame,
            { gameId: game.id },
            {
                repeat: {
                    cron: SYNC_SOURCES_AT
                },
                jobId: game.id,
                priority: 2
            }
        );
    }
};

main().catch(error => {
    console.error(error);
    process.exit(1);
});
