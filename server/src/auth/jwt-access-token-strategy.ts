
import { User } from '@game-watch/database';
import { EntityRepository, IdentifiedReference } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from "express";
import { Strategy } from 'passport-jwt';

import { Environment } from '../environment';

export const JWT_ACCESS_TOKEN_NAME = "game-watch-access-token";

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService<Environment, true>,
        @InjectRepository(User)
        private readonly userRepository: EntityRepository<User>,
    ) {
        super({
            jwtFromRequest: (request: Request) => request.cookies?.[JWT_ACCESS_TOKEN_NAME],
            ignoreExpiration: false,
            secretOrKey: Buffer.from(configService.get<string>("JWT_PUBLIC_KEY"), "base64").toString()
        });
    }

    public validate({ sub }: Record<string, unknown>): IdentifiedReference<User> {
        if (typeof sub !== "string") {
            throw new UnauthorizedException();
        }

        return this.userRepository.getReference(sub, { wrapped: true });
    }
}
