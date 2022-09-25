import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsEmail,
    IsEnum,
    IsISO31661Alpha2,
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
    @IsISO31661Alpha2()
    public country: Country;

    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(1)
    @IsEnum(InfoSourceType, { each: true })
    public interestedInSources: InfoSourceType[];
}
