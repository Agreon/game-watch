import { Game, mikroOrmConfig } from "@game-watch/database";
import { createQueue, QueueType } from "@game-watch/queue";
import { MikroORM } from "@mikro-orm/core";

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
                    cron: process.env.SYNC_SOURCES_AT
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
