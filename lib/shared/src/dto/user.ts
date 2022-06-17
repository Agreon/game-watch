import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsString, Length } from "class-validator";

import { Country, InfoSourceType, UserState } from "../types";

export interface UserDto {
    id: string;
    username: string | null;
    email: string | null;
    enableEmailNotifications: boolean;
    state: UserState;
    interestedInSources: InfoSourceType[];
    country: Country;
}

export class UpdateUserSettingsDto {
    @IsString()
    @Length(2, 2)
    public country: Country;

    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(1)
    @IsEnum(InfoSourceType, { each: true })
    public interestedInSources: InfoSourceType[];
}
