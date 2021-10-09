import { Configuration } from "@mikro-orm/core";
import { Game } from "./game/game-model";
import { InfoSource } from "./info-source/info-source-model";
import * as dotenv from "dotenv";

dotenv.config();

export default {
    entities: [Game, InfoSource],
    type: 'postgresql' as keyof typeof Configuration.PLATFORMS,
    clientUrl: process.env.DATABASE_URL,
};