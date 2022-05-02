import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsString, Length } from "class-validator";

import { Country, InfoSourceType, UserState } from "../types";

export interface UserDto {
    id: string;
    username: string | null;
    state: UserState;
    interestedInSources: InfoSourceType[];
    country: Country;
}

export class UpdateUserSettingsDto {
    // TODO: More narrow? => Use enum?
    @IsString()
    @Length(2, 2)
    public country: Country;

    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(1)
    @IsEnum(InfoSourceType, { each: true })
    public interestedInSources: InfoSourceType[];
}
