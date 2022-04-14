import { IsArray, IsNotEmpty, IsString, Length } from "class-validator";

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
    @Length(2)
    public country: Country;

    // TODO: Use Enum Array?
    @IsArray()
    @IsNotEmpty()
    public interestedInSources: InfoSourceType[];
}
