import { IsBoolean, IsEmail, IsString, IsUUID, Length } from "class-validator";

export class CreateUserDto {
    @IsUUID()
    public id: string;
}

export class RegisterUserDto {
    @IsUUID()
    public id: string;

    @IsString()
    @Length(1, 255)
    public username: string;

    @IsString()
    @Length(8, 255)
    public password: string;

    @IsString()
    @IsEmail()
    @Length(1, 255)
    public email?: string;

    @IsBoolean()
    public enableEmailNotifications: boolean;
}
