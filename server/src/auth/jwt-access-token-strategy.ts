
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
        configService: ConfigService<Environment, true>
    ) {
        super({
            jwtFromRequest: (request: Request) => { console.log("COOKIE", request.cookies); return request.cookies?.[JWT_ACCESS_TOKEN_NAME]; },
            ignoreExpiration: false,
            secretOrKey: Buffer.from(configService.get<string>("JWT_PUBLIC_KEY"), "base64").toString()
        });
    }

    public validate({ sub }: Record<string, unknown>): string {
        if (typeof sub !== "string") {
            throw new UnauthorizedException();
        }

        return sub;
    }
}
