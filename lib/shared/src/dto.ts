
import { IsEnum, IsString } from "class-validator";

import { GameData, InfoSourceType, NotificationData, NotificationType } from "./types";

export interface TagDto {
    id: string;
    name: string;
    color: string;
}

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

export interface GameDto {
    id: string
    search: string
    name: string | null
    syncing: boolean
    setupCompleted: boolean
    infoSources: InfoSourceDto[]
    tags: TagDto[]
}

export interface NotificationDto<T extends NotificationType = NotificationType> {
    id: string;
    createdAt: string;
    type: T;
    read: boolean;
    data: NotificationData[T];
    game: GameDto;
    infoSource: InfoSourceDto;
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
