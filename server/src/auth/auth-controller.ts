import { Body, Controller, Post } from "@nestjs/common";
import { IsEmail, IsString } from "class-validator";

import { User } from "./user-model";
import { UserService } from "./user-service";

export class RegisterDto implements Partial<User> {
    @IsEmail()
    public email: string;

    @IsString()
    public password: string;
}

@Controller("/auth")
export class AuthController {

    public constructor(
        private readonly userService: UserService
    ) { }

    @Post("/register")
    public async register(
        @Body() params: RegisterDto
    ) {
        const user = await this.userService.createUser(params);
        // TODO: Create token
    }
}