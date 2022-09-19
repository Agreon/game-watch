import { User } from '@game-watch/database';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { Environment } from '../environment';
import { AuthController } from './auth-controller';
import { AuthService } from './auth-service';
import { JwtAccessTokenStrategy } from './jwt-access-token-strategy';
import { JwtRefreshTokenStrategy } from './jwt-refresh-token-strategy';
import { JwtService } from './jwt-service';
import { LocalAuthStrategy } from './local-auth-strategy';

@Module({
    imports: [
        MikroOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService<Environment, true>) => ({
                publicKey: Buffer.from(
                    configService.get<string>('JWT_PUBLIC_KEY'),
                    'base64'
                ).toString(),
                privateKey: Buffer.from(
                    configService.get<string>('JWT_PRIVATE_KEY'),
                    'base64'
                ).toString(),
                signOptions: {
                    algorithm: configService.get('JWT_ALGORITHM'),
                },
            })
        }),
        PassportModule
    ],
    providers: [
        AuthService,
        LocalAuthStrategy,
        JwtAccessTokenStrategy,
        JwtRefreshTokenStrategy,
        JwtService
    ],
    controllers: [
        AuthController
    ],
    exports: []
})
export class AuthModule { }
