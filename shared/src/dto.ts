
import { IsEnum, IsString } from "class-validator";
import { GameData, InfoSourceType } from "./types";

export interface TagDto {
    id: string;
    name: string;
    color: string;
}

export interface InfoSourceDto<T extends InfoSourceType = InfoSourceType> {
    id: string
    type: T
    remoteGameId: string;
    disabled: boolean
    resolveError: boolean
    data: GameData[T] | null
}

export interface GameDto {
    id: string
    search: string
    name: string | null
    infoSources: InfoSourceDto[]
    tags: TagDto[]
}


export class CreateGameDto {
    @IsString()
    public search: string;
}

export class UpdateGameDto {
    @IsString()
    public name: string;
}

export class CreateInfoSourceDto {
    @IsString()
    public gameId: string;

    @IsString()
    public url: string;

    @IsEnum(InfoSourceType)
    public type: InfoSourceType;
}

export class CreateTagDto {
    @IsString()
    public name: string;

    @IsString()
    public color: string;
}