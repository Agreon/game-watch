import { User } from '@game-watch/database';
import { UpdateUserSettingsDto, UserDto } from '@game-watch/shared';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Body, Controller, Delete, Get, HttpStatus, Put, Query, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { Environment } from 'src/environment';

import { CurrentUser } from '../auth/current-user-decorator';
import { JwtAccessTokenGuard } from '../auth/jwt-access-token-guard';
import { UserService } from './user-service';

@Controller('/user')
export class UserController {
    public constructor(
        private readonly userService: UserService,
        @InjectRepository(User)
        private readonly userRepository: EntityRepository<User>,
        private readonly configService: ConfigService<Environment, true>
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

    @Get('/confirm')
    public async confirm(
        @Query('token') token: string,
        @Res() response: Response
    ) {
        if (!token) {
            throw new Error("'token' is missing");
        }
        await this.userService.confirmEmailAddress(token);

        return response.redirect(
            HttpStatus.SEE_OTHER,
            new URL('?mailConfirmed=true', this.configService.get('PUBLIC_URL')).toString()
        );
    }

    @Get('/unsubscribe')
    public async unsubscribe(
        @Query('id') userId: string,
        @Res() response: Response
    ) {
        if (!userId) {
            throw new Error("'userId' is missing");
        }
        await this.userService.unsubscribeFromNotifications(userId);

        return response.redirect(
            HttpStatus.SEE_OTHER,
            new URL('?unsubscribed=true', this.configService.get('PUBLIC_URL')).toString()
        );
    }

    @Delete()
    @UseGuards(JwtAccessTokenGuard)
    public async deleteAccount(
        @CurrentUser() userId: string
    ){
        return await this.userService.deleteUserAccount(userId);
    }
}
