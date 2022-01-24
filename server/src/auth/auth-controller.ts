import { User, UserState } from "@game-watch/database";
import { CreateUserDto, RegisterUserDto, TokenDto } from "@game-watch/shared";
import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { BadRequestException, Body, ConflictException, Controller, Post, UseGuards } from "@nestjs/common";

import { AuthService } from "./auth-service";
import { CurrentUser } from "./current-user-decorator";
import { JwtService } from "./jwt-service";
import { LocalAuthGuard } from "./local-auth-guard";

@Controller("/auth")
export class AuthController {

    public constructor(
        private readonly authService: AuthService,
        private readonly jwtService: JwtService,
        @InjectRepository(User)
        private readonly userRepository: EntityRepository<User>
    ) { }

    @Post("/create")
    public async createUser(
        @Body() { id }: CreateUserDto
    ): Promise<TokenDto> {
        const existingUserWithId = await this.userRepository.findOne(id);
        if (existingUserWithId) {
            // Don't let others hijack existing accounts.
            if (existingUserWithId.state !== UserState.Trial) {
                throw new BadRequestException();
            }

            // This route can also be used for users that have their id locally to re-authenticate.
            return {
                accessToken: await this.jwtService.createJwtAccessTokenForUser(existingUserWithId),
                refreshToken: await this.jwtService.createJwtRefreshTokenForUser(existingUserWithId)
            };
        }

        const user = await this.authService.createUser({ id });

        return {
            accessToken: await this.jwtService.createJwtAccessTokenForUser(user),
            refreshToken: await this.jwtService.createJwtRefreshTokenForUser(user)
        };
    }

    @Post("/register")
    public async registerUser(
        @Body() { id, username, password }: RegisterUserDto
    ): Promise<TokenDto> {
        const existingUser = await this.userRepository.findOne({ username });
        if (existingUser) {
            throw new ConflictException();
        }

        // Again, don't let others hijack existing accounts.
        const userToRegister = await this.userRepository.findOneOrFail(id);
        if (userToRegister.state !== UserState.Trial) {
            throw new BadRequestException();
        }

        const registeredUser = await this.authService.registerUser({ id, username, password });

        return {
            accessToken: await this.jwtService.createJwtAccessTokenForUser(registeredUser),
            refreshToken: await this.jwtService.createJwtRefreshTokenForUser(registeredUser)
        };
    }

    @Post("/login")
    @UseGuards(LocalAuthGuard)
    public async loginUser(
        @CurrentUser() user: User
    ): Promise<TokenDto> {
        return {
            accessToken: await this.jwtService.createJwtAccessTokenForUser(user),
            refreshToken: await this.jwtService.createJwtRefreshTokenForUser(user)
        };
    }
}
