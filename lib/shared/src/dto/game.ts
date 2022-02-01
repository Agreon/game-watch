
import { IsString, Length } from "class-validator";

import { InfoSourceDto } from "./info-source";
import { TagDto } from "./tag";

export interface GameDto {
    id: string
    search: string
    name: string | null
    syncing: boolean
    setupCompleted: boolean
    infoSources: InfoSourceDto[]
    tags: TagDto[]
}

export class CreateGameDto {
    @IsString()
    @Length(1, 255)
    public search: string;
}

export class UpdateGameDto {
    @IsString()
    @Length(1, 255)
    public name: string;
}
