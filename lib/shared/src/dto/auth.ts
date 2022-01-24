import { User } from "@game-watch/database";
import { IsEmail, IsString, IsUUID } from "class-validator";

export class TokenDto {
    public accessToken: string;
    public refreshToken: string;
}

export class CreateUserDto {
    @IsUUID()
    public id: string;
}

export class RegisterUserDto implements Partial<User> {
    @IsUUID()
    public id: string;

    @IsEmail()
    public username: string;

    @IsString()
    public password: string;
}


export class LoginUserDto implements Partial<User> {
    @IsEmail()
    public username: string;

    @IsString()
    public password: string;
}
