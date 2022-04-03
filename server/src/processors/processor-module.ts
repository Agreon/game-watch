import { Module } from "@nestjs/common";

import { GameModule } from "../game/game-module";
import { DeleteUnfinishedGameProcessor } from "../queue/processors/delete-unfinished-game-processor";

@Module({
    imports: [GameModule],
    providers: [DeleteUnfinishedGameProcessor]
})
export class ProcessorModule { }