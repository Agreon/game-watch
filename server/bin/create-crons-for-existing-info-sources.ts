import { InfoSource, mikroOrmConfig } from "@game-watch/database";
import { createQueue, QueueType } from "@game-watch/queue";
import { parseEnvironment } from "@game-watch/service";
import { MikroORM } from "@mikro-orm/core";

import { EnvironmentStructure } from "../src/environment";

const { SYNC_SOURCES_AT } = parseEnvironment(EnvironmentStructure, process.env);

const main = async () => {
    const queue = createQueue(QueueType.ResolveSource);

    const orm = await MikroORM.init(mikroOrmConfig);
    const infoSources = await orm.em.find(InfoSource, {});

    for (const infoSource of infoSources) {
        console.log("Adding cron for", infoSource.id);

        await queue.removeRepeatableByKey(
            `${QueueType.ResolveSource}:${infoSource.id}:::${SYNC_SOURCES_AT}`
        );

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
    }
};

main().catch(error => {
    console.error(error);
    process.exit(1);
});
