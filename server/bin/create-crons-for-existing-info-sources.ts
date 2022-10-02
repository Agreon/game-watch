import { InfoSource, mikroOrmConfig } from '@game-watch/database';
import { createQueueHandle, QueueType } from '@game-watch/queue';
import { parseEnvironment } from '@game-watch/service';
import { InfoSourceState } from '@game-watch/shared';
import { MikroORM } from '@mikro-orm/core';

import { EnvironmentStructure } from '../src/environment';

const { SYNC_SOURCES_AT } = parseEnvironment(EnvironmentStructure, process.env);

const main = async () => {
    const queue = createQueueHandle(QueueType.ResolveSource);

    const orm = await MikroORM.init({ ...mikroOrmConfig, allowGlobalContext: true });
    const infoSources = await orm.em.find(InfoSource, {});

    for (const infoSource of infoSources) {
        console.log('Adding cron for', infoSource.id);

        await queue.removeRepeatableByKey(
            `${QueueType.ResolveSource}:${infoSource.id}:::${SYNC_SOURCES_AT}`
        );

        console.log('Removed old cron for', infoSource.id);

        if (infoSource.state === InfoSourceState.Disabled) {
            continue;
        }

        await queue.add(
            QueueType.ResolveSource,
            { sourceId: infoSource.id },
            {
                repeat: {
                    cron: SYNC_SOURCES_AT
                },
                jobId: infoSource.id,
                priority: 2
            }
        );

        console.log('Added cron for', infoSource.id);
    }

    console.log('Added crons for', infoSources.length, 'sources');

    await queue.close();
};

main().catch(error => {
    console.error(error);
    process.exit(1);
});
