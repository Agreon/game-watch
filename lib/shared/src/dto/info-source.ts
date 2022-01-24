import { IsEnum, IsString } from "class-validator";

import { GameData, InfoSourceType } from "../types";

export interface InfoSourceDto<T extends InfoSourceType = InfoSourceType> {
    id: string
    type: T
    remoteGameId: string;
    remoteGameName: string;
    syncing: boolean
    disabled: boolean
    resolveError: boolean
    data: GameData[T] | null
}

export class CreateInfoSourceDto {
    @IsString()
    public gameId: string;

    @IsString()
    public url: string;

    @IsEnum(InfoSourceType)
    public type: InfoSourceType;
}
