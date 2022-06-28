import { User } from "@game-watch/database";
import { UpdateUserSettingsDto, UserDto } from "@game-watch/shared";
import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Body, Controller, Get, Put, Query, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";

import { CurrentUser } from "../auth/current-user-decorator";
import { JwtAccessTokenGuard } from "../auth/jwt-access-token-guard";
import { UserService } from "./user-service";

@Controller("/user")
export class UserController {
    public constructor(
        private readonly userService: UserService,
        @InjectRepository(User)
        private readonly userRepository: EntityRepository<User>,
    ) { }

    @Get()
    @UseGuards(JwtAccessTokenGuard)
    public async getUser(
        @CurrentUser() userId: string
    ): Promise<UserDto> {
        return await this.userRepository.findOneOrFail(userId);
    }

    @Put()
    @UseGuards(JwtAccessTokenGuard)
    public async updateUserSettings(
        @CurrentUser() userId: string,
        @Body() updateUserSettingsDto: UpdateUserSettingsDto
    ): Promise<UserDto> {
        return await this.userService.updateUserSettings(userId, updateUserSettingsDto);
    }

    @Get("/confirm")
    public async confirm(
        @Query("token") token: string,
        @Res() response: Response
    ) {
        await this.userService.confirmEmailAddress(token);

        return response.send("E-Mail Address confirmed!");
    }

    @Get("/unsubscribe")
    public async unsubscribe(
        @Query("id") userId: string,
        @Res() response: Response
    ) {
        await this.userService.unsubscribeFromNotifications(userId);

        return response.send("You successfully unsubscribed!");
    }
}
