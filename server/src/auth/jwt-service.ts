import { User } from "@game-watch/database";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService as NestJwtService } from "@nestjs/jwt";

import { Environment } from "../environment";

@Injectable()
export class JwtService {
    private jwtPrivateKey: string;

    public constructor(
        private readonly jwtService: NestJwtService,
        private readonly configService: ConfigService<Environment, true>
    ) {
        this.jwtPrivateKey = Buffer.from(configService.get<string>("JWT_PRIVATE_KEY"), "base64").toString();
    }

    public async createJwtAccessTokenForUser(user: User) {
        return await this.jwtService.signAsync(
            { sub: user.id, typ: "jwt" },
            {
                privateKey: this.jwtPrivateKey,
                expiresIn: this.configService.get("JWT_ACCESS_TOKEN_EXPIRES_IN")
            }
        );
    }

    public async createJwtRefreshTokenForUser(user: User) {
        return await this.jwtService.signAsync(
            { sub: user.id, typ: "refresh" },
            {
                privateKey: this.jwtPrivateKey,
                expiresIn: this.configService.get("JWT_REFRESH_TOKEN_EXPIRES_IN")
            }
        );
    }
}
