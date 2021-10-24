import { BadRequestException, Body, Controller, Param, Post } from "@nestjs/common";
import { IsEnum, IsString } from "class-validator";

import { UrlNotMappableError } from "../resolve/resolve-service";
import { InfoSource, InfoSourceType } from "./info-source-model";
import { InfoSourceService } from "./info-source-service";

export class CreateInfoSourceDto {
    @IsString()
    public gameId: string;

    @IsString()
    public url: string;

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
        @Body() { url, type, gameId }: CreateInfoSourceDto
    ): Promise<InfoSource> {
        try {
            return await this.infoSourceService.addInfoSource(gameId, type, url);
        } catch (error) {
            if (error instanceof UrlNotMappableError) {
                throw new BadRequestException();
            }
            throw error;
        }
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