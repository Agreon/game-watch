import { BadRequestException, Body, Controller, Param, Post } from "@nestjs/common";
import { CreateInfoSourceDto, InfoSourceDto } from "game-watch-shared";

import { UrlNotMappableError } from "../resolve/resolve-service";
import { InfoSourceService } from "./info-source-service";

@Controller("/info-source")
export class InfoSourceController {
    public constructor(
        private readonly infoSourceService: InfoSourceService
    ) { }

    @Post()
    public async create(
        @Body() { url, type, gameId }: CreateInfoSourceDto
    ): Promise<InfoSourceDto> {
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
    ): Promise<InfoSourceDto> {
        return await this.infoSourceService.syncInfoSource(infoSourceId);
    }

    @Post("/:infoSourceId/disable")
    public async disableInfoSource(
        @Param("infoSourceId") infoSourceId: string
    ): Promise<InfoSourceDto> {
        return await this.infoSourceService.disableInfoSource(infoSourceId);
    }
}