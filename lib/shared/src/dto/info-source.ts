import { IsEnum, IsString, Length } from "class-validator";

import { GameData, InfoSourceState, InfoSourceType } from "../types";

export interface InfoSourceDto<T extends InfoSourceType = InfoSourceType, S extends InfoSourceState = InfoSourceState> {
    id: string
    type: T
    state: S
    // TODO: If we remove those, move game.syncing:false to searchwr again
    remoteGameId: S extends InfoSourceState.Found | InfoSourceState.Resolved ? string : null
    remoteGameName: S extends InfoSourceState.Found | InfoSourceState.Resolved ? string : null
    data: S extends InfoSourceState.Resolved ? GameData[T] : null
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
