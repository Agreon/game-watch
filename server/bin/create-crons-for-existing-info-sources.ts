import { InfoSource, mikroOrmConfig } from "@game-watch/database";
import { createQueue, QueueType } from "@game-watch/queue";
import { MikroORM } from "@mikro-orm/core";

const main = async () => {
    const queue = createQueue(QueueType.ResolveSource);

    const orm = await MikroORM.init(mikroOrmConfig);
    const infoSources = await orm.em.find(InfoSource, {});

    for (const infoSource of infoSources) {
        console.log("Adding cron for", infoSource.id);

        queue.add(
            QueueType.ResolveSource,
            { sourceId: infoSource.id },
            {
                repeat: {
                    cron: process.env.SYNC_SOURCES_AT
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
