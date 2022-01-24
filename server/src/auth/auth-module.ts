import { User } from "@game-watch/database";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from '@nestjs/passport';

import { Environment } from "../environment";
import { AuthController } from "./auth-controller";
import { AuthService } from "./auth-service";
import { JwtService } from "./jwt-service";
import { LocalAuthStrategy } from "./local-auth-strategy";
@Module({
    imports: [
        MikroOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService<Environment>) => ({
                publicKey: configService.get("JWT_PUBLIC_KEY"),
                privateKey: configService.get("JWT_PRIVATE_KEY"),
                signOptions: {
                    algorithm: configService.get("JWT_ALGORITHM"),
                },
            })
        }),
        PassportModule
    ],
    providers: [
        AuthService,
        LocalAuthStrategy,
        JwtService
    ],
    controllers: [
        AuthController
    ],
    exports: []
})
export class AuthModule { }
