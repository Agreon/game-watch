import { Equals, IsBoolean, IsEmail, IsString, IsUUID, Length, ValidateIf } from 'class-validator';

export class CreateUserDto {
    @IsUUID()
    public id: string;
}

export class RegisterUserDto {
    @IsUUID()
    public id: string;

    @IsString()
    @Length(1, 255, {
        message: 'A username is required'
    })
    public username: string;

    @IsString()
    @Length(8, 255, {
        message: 'Your password must be at least 8 characters long'
    })
    public password: string;

    @ValidateIf(({ enableEmailNotifications }) => enableEmailNotifications)
    @Length(1, 255)
    @IsEmail({}, {
        message: 'Not a valid email'
    })
    public email?: string | null;

    @IsBoolean()
    public enableEmailNotifications: boolean;

    @IsBoolean()
    @Equals(true, {
        message: 'You musst accept the Terms Of Service'
    })
    public agreeToTermsOfService: boolean;
}
