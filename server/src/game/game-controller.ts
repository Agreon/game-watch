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

    @Post("/:gameId/sync")
    public async sync(
        @Param("gameId") gameId: string
    ): Promise<Game> {
        return await this.gameService.syncGame(gameId);
    }

    @Put("/:gameId")
    public async update(
        @Param("gameId") gameId: string,
        @Body() { name }: UpdateGameDto
    ): Promise<Game> {
        return await this.gameService.updateGameName(gameId, name);
    }

    @Delete("/:gameId")
    public async delete(
        @Param("gameId") gameId: string
    ): Promise<void> {
        await this.gameService.deleteGame(gameId);
    }
}