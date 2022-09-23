import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsString,
    Length,
    ValidateIf,
} from 'class-validator';

import { Country, InfoSourceType, UserState } from '../types';

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

    @ValidateIf(({ enableEmailNotifications }) => enableEmailNotifications)
    @Length(1, 255)
    @IsEmail()
    public email?: string | null;

    @IsString()
    @Length(2, 5)
    public country: Country;

    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(1)
    @IsEnum(InfoSourceType, { each: true })
    public interestedInSources: InfoSourceType[];
}
