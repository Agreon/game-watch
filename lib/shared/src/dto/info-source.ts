import { IsBoolean, IsEnum, IsString, Length } from 'class-validator';

import { BaseGameData, Country, GameData, InfoSourceState, InfoSourceType } from '../types';

export type InfoSourceData<
    T extends InfoSourceType = InfoSourceType,
    S extends InfoSourceState = InfoSourceState
> =
    S extends InfoSourceState.Resolved ?
    GameData[T]
    : BaseGameData

export interface InfoSourceDto<
    T extends InfoSourceType = InfoSourceType,
    S extends InfoSourceState = InfoSourceState
> {
    id: string
    type: T
    state: S
    data: InfoSourceData<T, S>
    country: Country
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

export class DisableInfoSourceDto {
    @IsBoolean()
    public continueSearching: boolean;
}
