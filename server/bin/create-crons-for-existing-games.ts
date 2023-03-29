import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '..', '.env') });

import { Game, mikroOrmConfig } from '@game-watch/database';
import { createQueueHandle, NIGHTLY_JOB_OPTIONS, QueueType } from '@game-watch/queue';
import { getCronForNightlySync } from '@game-watch/service';
import { MikroORM } from '@mikro-orm/core';

const main = async () => {
    const purgeOldCrons = process.argv.slice(2)[0] === '--purge';

    const queue = createQueueHandle(QueueType.SearchGame);

    const orm = await MikroORM.init({ ...mikroOrmConfig, allowGlobalContext: true });
    const games = await orm.em.find(Game, { setupCompleted: true }, { populate: ['user'] });

    for (const game of games) {
        const cron = getCronForNightlySync(game.user.getEntity().country);

        if (purgeOldCrons || !game.continueSearching) {
            await queue.removeRepeatableByKey(
                `${QueueType.SearchGame}:${game.id}:::${cron}`
            );
            console.log('Removed old cron for', game.id);
        }

        if (game.continueSearching) {
            await queue.add(
                QueueType.SearchGame,
                { gameId: game.id },
                {
                    repeat: {
                        pattern: cron
                    },
                    jobId: game.id,
                    priority: 2,
                    ...NIGHTLY_JOB_OPTIONS
                }
            );

            console.log('Added cron for', game.id);
        }
    }

    console.log('Added crons for', games.length, 'games');

    await queue.close();
};

main()
    .catch(error => {
        console.error(error);
        process.exit(1);
    }).then(
        () => process.exit(0)
    );
