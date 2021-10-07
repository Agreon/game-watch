import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Game } from "./game-model";
import { GameService } from "./game-service";

export class CreateGameDto {
    public search: string;
}

@Controller("/game")
export class GameController {
    public constructor(
        private readonly gameService: GameService,
    ) { }

    @Post()
    public async create(
        // TODO: Validation
        @Body() { search }: CreateGameDto
    ): Promise<Game> {
        return await this.gameService.createGame(search);
    }

    @Post("/:gameId/sync")
    public async sync(
        @Param("gameId") gameId: string
    ): Promise<Game> {
        return await this.gameService.syncGame(gameId);
    }

    @Get()
    public async getAll() {
        return await this.gameService.getGames();
    }
}