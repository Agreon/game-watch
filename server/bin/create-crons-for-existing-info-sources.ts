import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '..', '.env') });

import { InfoSource, mikroOrmConfig } from '@game-watch/database';
import { createQueueHandle, NIGHTLY_JOB_OPTIONS, QueueType } from '@game-watch/queue';
import { getCronForNightlySync } from '@game-watch/service';
import { InfoSourceState } from '@game-watch/shared';
import { MikroORM } from '@mikro-orm/core';

const main = async () => {
    const purgeOldCrons = process.argv.slice(2)[0] === '--purge';

    const queue = createQueueHandle(QueueType.ResolveSource);

    const orm = await MikroORM.init({ ...mikroOrmConfig, allowGlobalContext: true });
    const infoSources = await orm.em.find(InfoSource, {});

    for (const infoSource of infoSources) {
        const cron = getCronForNightlySync(infoSource.country);

        if (purgeOldCrons || infoSource.state === InfoSourceState.Disabled) {
            await queue.removeRepeatableByKey(
                `${QueueType.ResolveSource}:${infoSource.id}:::${cron}`
            );
            console.log('Removed old cron for', infoSource.id);
        }

        if (infoSource.state !== InfoSourceState.Disabled) {
            await queue.add(
                QueueType.ResolveSource,
                { sourceId: infoSource.id },
                {
                    repeat: {
                        pattern: cron
                    },
                    jobId: infoSource.id,
                    priority: 2,
                    ...NIGHTLY_JOB_OPTIONS
                }
            );

            console.log('Added cron for', infoSource.id);
        }
    }

    console.log('Added crons for', infoSources.length, 'sources');

    await queue.close();
};

main()
    .catch(error => {
        console.error(error);
        process.exit(1);
    }).then(
        () => process.exit(0)
    );
