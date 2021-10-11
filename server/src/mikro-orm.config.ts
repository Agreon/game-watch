import { Configuration } from "@mikro-orm/core";
import { MikroOrmModuleSyncOptions } from "@mikro-orm/nestjs";
import * as dotenv from "dotenv";
import path from 'path';

import { Game } from "./game/game-model";
import { InfoSource } from "./info-source/info-source-model";
import { Migration20211010133200 } from "./migrations/Migration20211010133200";

dotenv.config({ path: path.join(__dirname, "..", "..", '.env') });

const config: MikroOrmModuleSyncOptions = {
    entities: [Game, InfoSource],
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
            { name: "Migration20211010133200.ts", class: Migration20211010133200 }
        ]
    }
};

export default config;
