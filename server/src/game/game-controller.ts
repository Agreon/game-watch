import { Body, Controller, Get, Post } from "@nestjs/common";
import { Game } from "./game-model";
import { GameService } from "./game-service";

export class CreateGameDto {
    public name: string;
}

@Controller("/game")
export class GameController {
    public constructor(
        private readonly gameService: GameService
    ) { }

    @Post()
    public async create(
        @Body() { name }: CreateGameDto
    ): Promise<Game> {
        return await this.gameService.createGame(name);
    }

    @Get()
    public async getAll() {
        return await this.gameService.getGames();
    }
}