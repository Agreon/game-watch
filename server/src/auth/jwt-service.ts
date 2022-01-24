import { User } from "@game-watch/database";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService as NestJwtService } from "@nestjs/jwt";

import { Environment } from "../environment";

@Injectable()
export class JwtService {
    public constructor(
        private readonly jwtService: NestJwtService,
        private readonly configService: ConfigService<Environment>
    ) { }

    public async createJwtAccessTokenForUser(user: User) {
        return await this.jwtService.signAsync(
            { userId: user.id },
            {
                privateKey: this.configService.get("JWT_PRIVATE_KEY"),
                expiresIn: this.configService.get("JWT_ACCESS_TOKEN_EXPIRES_IN")
            }
        );
    }

    public async createJwtRefreshTokenForUser(user: User) {
        return await this.jwtService.signAsync(
            { userId: user.id },
            {
                privateKey: this.configService.get("JWT_PRIVATE_KEY"),
                expiresIn: this.configService.get("JWT_REFRESH_TOKEN_EXPIRES_IN")
            }
        );
    }
}
