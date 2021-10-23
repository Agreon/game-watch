import { Body, Controller, Param, Post } from "@nestjs/common";
import { IsEnum, IsString } from "class-validator";

import { InfoSource, InfoSourceType } from "./info-source-model";
import { InfoSourceService } from "./info-source-service";

export class CreateInfoSourceDto {
    @IsString()
    public gameId: string;

    @IsString()
    public remoteGameId: string;

    @IsEnum(InfoSourceType)
    public type: InfoSourceType;
}

export class UpdateInfoSourceDto {
    @IsString()
    public search: string;
}


@Controller("/info-source")
export class InfoSourceController {
    public constructor(
        private readonly infoSourceService: InfoSourceService
    ) { }

    @Post()
    public async create(
        @Body() { remoteGameId, type, gameId }: CreateInfoSourceDto
    ): Promise<InfoSource> {
        // TODO: check remoteGameId
        return await this.infoSourceService.addInfoSource(gameId, type, remoteGameId);
    }

    @Post("/:infoSourceId/sync")
    public async syncInfoSource(
        @Param("infoSourceId") infoSourceId: string
    ) {
        return await this.infoSourceService.syncInfoSource(infoSourceId);
    }

    @Post("/:infoSourceId/disable")
    public async disableInfoSource(
        @Param("infoSourceId") infoSourceId: string
    ) {
        return await this.infoSourceService.disableInfoSource(infoSourceId);
    }
}