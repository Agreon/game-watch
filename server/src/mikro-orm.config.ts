import { Configuration } from "@mikro-orm/core";
import { MikroOrmModuleSyncOptions } from "@mikro-orm/nestjs";
import * as dotenv from "dotenv";
import path from 'path';

import { Game } from "./game/game-model";
import { InfoSource } from "./info-source/info-source-model";
import { Migration20211012071707 } from "./migrations/Migration20211012071707";
import { Migration20211016065028 } from "./migrations/Migration20211016065028";
import { Tag } from "./tag/tag-model";

dotenv.config({ path: path.join(__dirname, "..", "..", '.env') });

const config: MikroOrmModuleSyncOptions = {
    entities: [Game, InfoSource, Tag],
    type: 'postgresql' as keyof typeof Configuration.PLATFORMS,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    dbName: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    port: parseInt(process.env.DATABASE_PORT!, 10),
    migrations: {
        path: './src/migrations',
        migrationsList: [
            { name: "Migration20211012071707.ts", class: Migration20211012071707 },
            { name: "Migration20211016065028.ts", class: Migration20211016065028 }
        ]
    }
};

export default config;
