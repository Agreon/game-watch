import { Game, mikroOrmConfig } from '@game-watch/database';
import { createQueueHandle, QueueType } from '@game-watch/queue';
import { parseEnvironment } from '@game-watch/service';
import { MikroORM } from '@mikro-orm/core';

import { EnvironmentStructure } from '../src/environment';

const { SYNC_SOURCES_AT } = parseEnvironment(EnvironmentStructure, process.env);

const main = async () => {
    const queue = createQueueHandle(QueueType.SearchGame);

    const orm = await MikroORM.init({ ...mikroOrmConfig, allowGlobalContext: true });
    const games = await orm.em.find(Game, { setupCompleted: true });

    for (const game of games) {
        console.log('Adding cron for', game.id);

        await queue.removeRepeatableByKey(
            `${QueueType.SearchGame}:${game.id}:::${SYNC_SOURCES_AT}`
        );

        console.log('Removed old cron for', game.id);

        await queue.add(
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

        console.log('Added cron for', game.id);
    }

    console.log('Added crons for', games.length, 'games');

    await queue.close();
};

main().catch(error => {
    console.error(error);
    process.exit(1);
});
