import { Game, Tag, User } from '@game-watch/database';
import { CreateGameDto, GameDto, SetupGameDto, UpdateGameDto } from '@game-watch/shared';
import { IdentifiedReference } from '@mikro-orm/core';
import { Body, Controller, Delete, Get, Param, ParseBoolPipe, Post, Put, Query, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user-decorator';
import { JwtAccessTokenGuard } from '../auth/jwt-access-token-guard';
import { UserIsOwner } from '../pipes/user-is-owner-pipe';
import { GameService } from './game-service';

@UseGuards(JwtAccessTokenGuard)
@Controller('/game')
export class GameController {
    public constructor(
        private readonly gameService: GameService,
    ) { }

    @Post()
    public async create(
        @Body() { search }: CreateGameDto,
        @CurrentUser() user: IdentifiedReference<User>
    ): Promise<GameDto> {
        const createdGame = await this.gameService.createGame(search, user);

        return await this.gameService.getGame(createdGame.id);
    }

    @Get()
    public async getAllGames(
        @CurrentUser() user: IdentifiedReference<User>,
        @Query('withTags') withTags?: string[],
        @Query('withInfoSources') withInfoSources?: string[],
        @Query('onlyAlreadyReleased', ParseBoolPipe) onlyAlreadyReleased?: boolean,
    ): Promise<GameDto[]> {
        return await this.gameService.getGames({
            withTags,
            withInfoSources,
            onlyAlreadyReleased,
            user,
        });
    }

    @Get('/:id')
    public async getGame(
        @Param('id', UserIsOwner) { id }: Game
    ): Promise<GameDto> {
        return await this.gameService.getGame(id);
    }

    @Post('/:id/sync')
    public async sync(
        @Param('id', UserIsOwner) { id }: Game
    ): Promise<GameDto> {
        await this.gameService.syncGame(id);

        return await this.gameService.getGame(id);
    }

    @Post('/:id/setup')
    public async setup(
        @Param('id', UserIsOwner) { id }: Game,
        @Body() { name, continueSearching }: SetupGameDto
    ): Promise<GameDto> {
        await this.gameService.setupGame(id, { name, continueSearching });

        return await this.gameService.getGame(id);
    }

    @Post('/:id/tag/:tagId')
    public async addTag(
        @Param('id', UserIsOwner) { id }: Game,
        @Param('tagId', UserIsOwner) tag: Tag
    ): Promise<GameDto> {
        await this.gameService.addTagToGame(id, tag);

        return await this.gameService.getGame(id);
    }

    @Delete('/:id/tag/:tagId')
    public async removeTag(
        @Param('id', UserIsOwner) { id }: Game,
        @Param('tagId', UserIsOwner) tag: Tag
    ): Promise<GameDto> {
        await this.gameService.removeTagFromGame(id, tag);

        return await this.gameService.getGame(id);
    }

    @Put('/:id')
    public async update(
        @Param('id', UserIsOwner) { id }: Game,
        @Body() { name }: UpdateGameDto
    ): Promise<GameDto> {
        await this.gameService.updateGameName(id, name);

        return await this.gameService.getGame(id);
    }

    @Delete('/:id')
    public async delete(
        @Param('id', UserIsOwner) { id }: Game,
    ): Promise<void> {
        await this.gameService.deleteGame(id);
    }
}
