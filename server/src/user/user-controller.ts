import { User } from "@game-watch/database";
import { UpdateUserSettingsDto, UserDto } from "@game-watch/shared";
import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";

import { CurrentUser } from "../auth/current-user-decorator";
import { JwtAccessTokenGuard } from "../auth/jwt-access-token-guard";
import { UserService } from "./user-service";

@Controller("/user")
@UseGuards(JwtAccessTokenGuard)
export class UserController {
    public constructor(
        private readonly userService: UserService,
        @InjectRepository(User)
        private readonly userRepository: EntityRepository<User>,
    ) { }

    @Get()
    public async getUser(
        @CurrentUser() userId: string
    ): Promise<UserDto> {
        return await this.userRepository.findOneOrFail(userId);
    }

    @Put()
    @UseGuards(JwtAccessTokenGuard)
    public async updateUserSettings(
        @CurrentUser() userId: string,
        @Body() { country, interestedInSources }: UpdateUserSettingsDto
    ): Promise<UserDto> {
        return await this.userService.updateUserSettings(userId, { country, interestedInSources });
    }
}
