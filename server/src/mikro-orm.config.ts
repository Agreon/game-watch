import { Configuration } from "@mikro-orm/core";
import { Game } from "./game/game-model";
import { InfoSource } from "./info-source/info-source-model";
import * as dotenv from "dotenv";
import path from 'path';

dotenv.config({ path: path.join(__dirname, "..", "..", '.env') });

export default {
    entities: [Game, InfoSource],
    type: 'postgresql' as keyof typeof Configuration.PLATFORMS,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    dbName: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    port: parseInt(process.env.DATABASE_PORT!, 10),
};