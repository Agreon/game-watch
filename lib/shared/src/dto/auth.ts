import { IsString, IsUUID } from "class-validator";

export class CreateUserDto {
    @IsUUID()
    public id: string;
}

export class RegisterUserDto {
    @IsUUID()
    public id: string;

    @IsString()
    public username: string;

    @IsString()
    public password: string;
}
