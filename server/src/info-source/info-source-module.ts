import { Game, InfoSource, Notification } from "@game-watch/database";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { MapperModule } from "../mapper/mapper-module";
import { QueueModule } from "../queue/queue-module";
import { InfoSourceController } from "./info-source-controller";
import { InfoSourceService } from "./info-source-service";

@Module({
    imports: [
        MikroOrmModule.forFeature([Game, InfoSource, Notification]),
        MapperModule,
        QueueModule
    ],
    providers: [
        InfoSourceService
    ],
    controllers: [
        InfoSourceController
    ]
})
export class InfoSourceModule { }
