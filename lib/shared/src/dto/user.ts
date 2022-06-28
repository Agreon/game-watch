import { ArrayMinSize, IsArray, IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsString, Length } from "class-validator";

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
    @IsBoolean()
    public enableEmailNotifications: boolean;

    @IsEmail()
    @Length(2, 255)
    public email: string;

    @IsString()
    @Length(2, 2)
    public country: Country;

    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(1)
    @IsEnum(InfoSourceType, { each: true })
    public interestedInSources: InfoSourceType[];
}
