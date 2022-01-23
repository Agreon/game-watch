import { Configuration } from "@mikro-orm/core";
import { MikroOrmModuleSyncOptions } from "@mikro-orm/nestjs";
import * as dotenv from "dotenv";
import path from 'path';

import { Migration20211012071707 } from "./migrations/Migration20211012071707";
import { Migration20211016065028 } from "./migrations/Migration20211016065028";
import { Migration20211016134626 } from "./migrations/Migration20211016134626";
import { Migration20211020104117 } from "./migrations/Migration20211020104117";
import { Migration20211020112018 } from "./migrations/Migration20211020112018";
import { Migration20211023134444 } from "./migrations/Migration20211023134444";
import { Migration20211115142225 } from "./migrations/Migration20211115142225";
import { Migration20211115142226 } from "./migrations/Migration20211115142226";
import { Migration20211115142230 } from "./migrations/Migration20211115142230";
import { Migration20211129140628 } from "./migrations/Migration20211129140628";
import { Game } from "./models/game-model";
import { InfoSource } from "./models/info-source-model";
import { Notification } from "./models/notification-model";
import { Tag } from "./models/tag-model";
import { User } from "./models/user-model";

dotenv.config({ path: path.join(__dirname, "..", "..", "..", ".env") });

const config: MikroOrmModuleSyncOptions = {
    entities: [Game, InfoSource, Tag, Notification, User],
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
            { name: "Migration20211016065028.ts", class: Migration20211016065028 },
            { name: "Migration20211016134626.ts", class: Migration20211016134626 },
            { name: "Migration20211020104117.ts", class: Migration20211020104117 },
            { name: "Migration20211020112018.ts", class: Migration20211020112018 },
            { name: "Migration20211023134444.ts", class: Migration20211023134444 },
            { name: "Migration20211115142225.ts", class: Migration20211115142225 },
            { name: "Migration20211129140628.ts", class: Migration20211129140628 },
            { name: "Migration20211115142226.ts", class: Migration20211115142226 },
            { name: "Migration20211115142230.ts", class: Migration20211115142230 },
        ]
    }
};

export default config;
