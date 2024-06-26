import { User } from '@game-watch/database';
import { UserState } from '@game-watch/shared';
import { EntityManager } from '@mikro-orm/core';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { Strategy } from 'passport-jwt';

import { Environment } from '../environment';

export const JWT_REFRESH_TOKEN_NAME = 'game-watch-refresh-token';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly logger: PinoLogger,
        configService: ConfigService<Environment, true>
    ) {
        super({
            jwtFromRequest: (request: Request) => request.cookies?.[JWT_REFRESH_TOKEN_NAME],
            ignoreExpiration: false,
            secretOrKey: Buffer.from(
                configService.get<string>('JWT_PUBLIC_KEY'),
                'base64'
            ).toString()
        });
    }

    public async validate({ sub }: Record<string, unknown>): Promise<User> {
        if (typeof sub !== 'string') {
            throw new UnauthorizedException();
        }

        this.logger.assign({ userId: sub });

        const user = await this.entityManager.findOne(User, sub);

        if (!user || user.state === UserState.Disabled) {
            throw new UnauthorizedException();
        }

        user.lastTokenRefresh = new Date();
        await this.entityManager.persistAndFlush(user);

        return user;
    }
}
