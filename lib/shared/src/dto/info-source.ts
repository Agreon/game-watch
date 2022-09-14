import { IsEnum, IsString, Length } from "class-validator";

import { GameData, InfoSourceState, InfoSourceType } from "../types";

export interface InfoSourceDto<T extends InfoSourceType = InfoSourceType, S extends InfoSourceState = InfoSourceState> {
    id: string
    type: T
    state: S
    remoteGameId: S extends InfoSourceState.Found | InfoSourceState.Resolved ? string : null
    remoteGameName: S extends InfoSourceState.Found | InfoSourceState.Resolved ? string : null
    data: S extends InfoSourceState.Resolved ? GameData[T] : null
    // TODO: Is this flag still necessary?
    // => Could be inferred from state?
    syncing: boolean
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
