import { Configuration } from "@mikro-orm/core";
import { Game } from "./game/game-model";
import { InfoSource } from "./game/info-source-model";

export default {
    entities: [Game, InfoSource],
    type: 'postgresql' as keyof typeof Configuration.PLATFORMS,
    clientUrl: 'postgresql://game_view:game_view@127.0.0.1:5437/game_view',
};