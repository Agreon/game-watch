
import { IsString } from "class-validator";

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
    public search: string;
}

export class UpdateGameDto {
    @IsString()
    public name: string;
}
