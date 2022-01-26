import { CreateInfoSourceDto, InfoSourceDto } from "@game-watch/shared";
import { BadRequestException, Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";

import { JwtAccessTokenGuard } from "../auth/jwt-access-token-guard";
import { UrlNotMappableError } from "../mapper/mapper-service";
import { InfoSourceService } from "./info-source-service";

@UseGuards(JwtAccessTokenGuard)
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

    @Get("/:id")
    public async getInfoSource(
        @Param("id") id: string
    ) {
        return await this.infoSourceService.getInfoSource(id);
    }

    @Post("/:id/sync")
    public async syncInfoSource(
        @Param("id") id: string
    ): Promise<InfoSourceDto> {
        return await this.infoSourceService.syncInfoSource(id);
    }

    @Post("/:id/disable")
    public async disableInfoSource(
        @Param("id") id: string
    ): Promise<InfoSourceDto> {
        return await this.infoSourceService.disableInfoSource(id);
    }
}
