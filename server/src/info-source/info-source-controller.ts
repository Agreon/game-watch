import { InfoSource, User } from "@game-watch/database";
import { CreateInfoSourceDto, DisableInfoSourceDto, InfoSourceDto } from "@game-watch/shared";
import { IdentifiedReference } from "@mikro-orm/core";
import { BadRequestException, Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";

import { CurrentUser } from "../auth/current-user-decorator";
import { JwtAccessTokenGuard } from "../auth/jwt-access-token-guard";
import { UrlNotMappableError } from "../mapper/mapper-service";
import { UserIsOwner } from "../pipes/user-is-owner-pipe";
import { InfoSourceService } from "./info-source-service";

@UseGuards(JwtAccessTokenGuard)
@Controller("/info-source")
export class InfoSourceController {
    public constructor(
        private readonly infoSourceService: InfoSourceService
    ) { }

    @Post()
    public async create(
        @Body() { url, type, gameId }: CreateInfoSourceDto,
        @CurrentUser() user: IdentifiedReference<User>
    ): Promise<InfoSourceDto> {
        try {
            return await this.infoSourceService.addInfoSource({ gameId, type, url, user });
        } catch (error) {
            if (error instanceof UrlNotMappableError) {
                throw new BadRequestException();
            }
            throw error;
        }
    }

    @Get("/:id")
    public async getInfoSource(
        @Param("id", UserIsOwner) { id }: InfoSource
    ): Promise<InfoSourceDto> {
        return await this.infoSourceService.getInfoSource(id);
    }

    @Post("/:id/sync")
    public async syncInfoSource(
        @Param("id", UserIsOwner) { id }: InfoSource
    ): Promise<InfoSourceDto> {
        return await this.infoSourceService.syncInfoSource(id);
    }

    @Post("/:id/disable")
    public async disableInfoSource(
        @Param("id", UserIsOwner) { id }: InfoSource,
        @Body() { continueSearching }: DisableInfoSourceDto
    ): Promise<InfoSourceDto> {
        return await this.infoSourceService.disableInfoSource(id, continueSearching);
    }
}
