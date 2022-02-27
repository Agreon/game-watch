import { IsEnum, IsString, Length } from "class-validator";

import { GameData, InfoSourceType } from "../types";

export interface InfoSourceDto<T extends InfoSourceType = InfoSourceType> {
    id: string
    type: T
    remoteGameId: string | null;
    remoteGameName: string | null;
    syncing: boolean
    disabled: boolean
    resolveError: boolean
    data: GameData[T] | null
}

export class CreateInfoSourceDto {
    @IsString()
    public gameId: string;

    @IsString()
    @Length(1, 255)
    public url: string;

    @IsEnum(InfoSourceType)
    public type: InfoSourceType;
}
