import { Game } from "@game-watch/database";
import { CreateGameDto, UpdateGameDto } from "@game-watch/shared";
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";

import { GameService } from "./game-service";

@Controller("/game")
export class GameController {
    public constructor(
        private readonly gameService: GameService,
    ) { }

    @Post()
    public async create(
        @Body() { search }: CreateGameDto
    ): Promise<Game> {
        return await this.gameService.createGame(search);
    }

    @Get()
    public async getAllGames(
        @Query("withTags") withTags?: string[],
        @Query("withInfoSources") withInfoSources?: string[]
    ): Promise<Game[]> {
        return await this.gameService.getGames({ withTags, withInfoSources });
    }

    @Get("/:id")
    public async getGame(
        @Param("id") id: string
    ): Promise<Game> {
        return await this.gameService.getGame(id);
    }

    @Post("/:id/sync")
    public async sync(
        @Param("id") id: string
    ): Promise<Game> {
        return await this.gameService.syncGame(id);
    }

    @Post("/:id/setup")
    public async setup(
        @Param("id") id: string,
        @Body() { name }: UpdateGameDto
    ): Promise<Game> {
        return await this.gameService.setupGame(id, name);
    }

    @Post("/:id/tag/:tagId")
    public async addTag(
        @Param("id") id: string,
        @Param("tagId") tagId: string
    ): Promise<Game> {
        return await this.gameService.addTagToGame(id, tagId);
    }

    @Delete("/:id/tag/:tagId")
    public async removeTag(
        @Param("id") id: string,
        @Param("tagId") tagId: string
    ): Promise<Game> {
        return await this.gameService.removeTagFromGame(id, tagId);
    }


    @Put("/:id")
    public async update(
        @Param("id") id: string,
        @Body() { name }: UpdateGameDto
    ): Promise<Game> {
        return await this.gameService.updateGameName(id, name);
    }

    @Delete("/:id")
    public async delete(
        @Param("id") id: string
    ): Promise<void> {
        await this.gameService.deleteGame(id);
    }
}