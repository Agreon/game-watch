import { User } from "@game-watch/database";
import { CreateUserDto, RegisterUserDto, UserDto, UserState } from "@game-watch/shared";
import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { BadRequestException, Body, ConflictException, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { CookieOptions, Response } from "express";
import ms from 'ms';

import { Environment } from "../environment";
import { AuthService } from "./auth-service";
import { CurrentUser } from "./current-user-decorator";
import { JwtAccessTokenGuard } from "./jwt-access-token-guard";
import { JWT_ACCESS_TOKEN_NAME } from "./jwt-access-token-strategy";
import { JwtRefreshTokenGuard } from "./jwt-refresh-token-guard";
import { JWT_REFRESH_TOKEN_NAME } from "./jwt-refresh-token-strategy";
import { JwtService } from "./jwt-service";
import { LocalAuthGuard } from "./local-auth-guard";

@Controller("/auth")
export class AuthController {
    private accessTokenCookieOptions: CookieOptions;
    private refreshTokenCookieOptions: CookieOptions;

    public constructor(
        private readonly authService: AuthService,
        private readonly jwtService: JwtService,
        @InjectRepository(User)
        private readonly userRepository: EntityRepository<User>,
        private readonly configService: ConfigService<Environment, true>
    ) {
        this.accessTokenCookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: ms(configService.get("JWT_ACCESS_TOKEN_EXPIRES_IN")),
        };

        this.refreshTokenCookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: ms(configService.get("JWT_REFRESH_TOKEN_EXPIRES_IN")),
        };
    }

    @Post("/create")
    @HttpCode(HttpStatus.OK)
    @UseGuards(ThrottlerGuard)
    @Throttle(2, 10)
    public async createUser(
        @Body() { id }: CreateUserDto,
        @Res() response: Response,
    ): Promise<Response<UserDto>> {
        const existingUserWithId = await this.userRepository.findOne(id);
        if (existingUserWithId) {
            // Don't let others hijack existing accounts.
            if (existingUserWithId.state !== UserState.Trial) {
                throw new BadRequestException();
            }

            return await this.setJwtCookiesForUser(existingUserWithId, response);
        }

        if (this.configService.get("DISABLE_USER_REGISTRATION")) {
            throw new BadRequestException("We are not allowing new user registrations at the moment");
        }

        const user = await this.authService.createUser({ id });

        return await this.setJwtCookiesForUser(user, response);
    }

    // TODO: Move to user-controller
    @Get("/user")
    @UseGuards(JwtAccessTokenGuard)
    public async getUser(
        @CurrentUser() userId: string
    ): Promise<UserDto> {
        return await this.userRepository.findOneOrFail(userId);
    }

    @Post("/register")
    @HttpCode(HttpStatus.OK)
    public async registerUser(
        @Body() { id, username, password }: RegisterUserDto,
        @Res() response: Response,
    ): Promise<Response<UserDto>> {
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

        delete (registeredUser as any).password;

        return await this.setJwtCookiesForUser(registeredUser, response);
    }

    @Post("/refresh")
    @UseGuards(JwtRefreshTokenGuard)
    @HttpCode(HttpStatus.OK)
    public async refreshToken(
        @CurrentUser() user: User,
        @Res() response: Response,
    ): Promise<Response<UserDto>> {
        return await this.setJwtCookiesForUser(user, response);
    }

    @Post("/login")
    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    public async loginUser(
        @CurrentUser() user: User,
        @Res() response: Response,
    ): Promise<Response<UserDto>> {
        return await this.setJwtCookiesForUser(user, response);
    }

    @Post("/logout")
    @UseGuards(JwtRefreshTokenGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    public async logoutUser(
        @Res() response: Response,
    ): Promise<Response<void>> {
        return response
            .clearCookie(JWT_ACCESS_TOKEN_NAME, this.accessTokenCookieOptions)
            .clearCookie(JWT_REFRESH_TOKEN_NAME, this.refreshTokenCookieOptions)
            .send();
    }

    private async setJwtCookiesForUser(user: User, response: Response): Promise<Response<User>> {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.createJwtAccessTokenForUser(user),
            this.jwtService.createJwtRefreshTokenForUser(user)
        ]);

        return response
            .cookie(JWT_ACCESS_TOKEN_NAME, accessToken, this.accessTokenCookieOptions)
            .cookie(JWT_REFRESH_TOKEN_NAME, refreshToken, this.refreshTokenCookieOptions)
            .send(user);
    }
}
