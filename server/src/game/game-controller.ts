import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { IsString } from "class-validator";

import { Game } from "./game-model";
import { GameService } from "./game-service";

export class CreateGameDto {
    @IsString()
    public search: string;
}

export class UpdateGameDto {
    @IsString()
    public name: string;
}

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
    public async getAll() {
        return await this.gameService.getGames();
    }

    @Post("/sync")
    public async syncAll(): Promise<void> {
        await this.gameService.syncAllGames();
    }

    @Post("/:id/sync")
    public async sync(
        @Param("id") id: string
    ): Promise<Game> {
        return await this.gameService.syncGame(id);
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