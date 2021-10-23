import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { Game } from "../game/game-model";
import { InfoSource } from "../info-source/info-source-model";
import { ResolveModule } from "../resolve/resolve-module";
import { InfoSourceController } from "./info-source-controller";
import { InfoSourceService } from "./info-source-service";

@Module({
    imports: [
        MikroOrmModule.forFeature([Game, InfoSource]),
        ResolveModule
    ],
    providers: [
        InfoSourceService
    ],
    controllers: [
        InfoSourceController
    ]
})
export class InfoSourceModule { }