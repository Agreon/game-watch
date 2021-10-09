import { Body, Controller, Param, Post, Put } from "@nestjs/common";
import { IsEnum, IsString } from "class-validator";
import { InfoSource, InfoSourceType } from "./info-source-model";
import { InfoSourceService } from "./infou-source-service";

export class CreateInfoSourceDto {
    @IsString()
    public search: string;

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
        @Body() { search, type }: CreateInfoSourceDto
    ): Promise<void> {
    }


    @Put("/:infoSourceId")
    public async update(
        @Body() { search }: UpdateInfoSourceDto
    ): Promise<void> {
    }

    @Post("/:infoSourceId/disable")
    public async disableInfoSource(
        @Param("infoSourceId") infoSourceId: string
    ) {
        return await this.infoSourceService.disableInfoSource(infoSourceId);
    }
}