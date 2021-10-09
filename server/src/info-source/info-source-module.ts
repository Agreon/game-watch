import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { InfoSource } from "../info-source/info-source-model";
import { InfoSourceController } from "./info-source-controller";
import { InfoSourceService } from "./infou-source-service";

@Module({
    imports: [
        MikroOrmModule.forFeature([InfoSource]),
    ],
    providers: [
        InfoSourceService
    ],
    controllers: [
        InfoSourceController
    ]
})
export class InfoSourceModule { }