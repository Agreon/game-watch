import { User } from '@game-watch/database';
import { Country, RegisterUserDto, UserState } from '@game-watch/shared';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';

import { Environment } from '../environment';

@Injectable()
export class AuthService {
    public constructor(
        private readonly entityManager: EntityManager,
        private readonly configService: ConfigService<Environment, true>
    ) { }

    public async createUser({ id, country }: { id: string; country: Country }): Promise<User> {
        const user = new User({ id, country });
        await this.entityManager.persistAndFlush(user);

        return user;
    }

    public async registerUser(
        {
            id,
            username,
            password,
            email,
            enableEmailNotifications,
        }: Omit<RegisterUserDto, 'agreeToTermsOfService'>
    ): Promise<User> {
        const userToRegister = await this.entityManager.findOneOrFail(User, id);

        userToRegister.username = username.toLocaleLowerCase();
        userToRegister.state = UserState.Registered;
        userToRegister.email = email ?? null;
        userToRegister.enableEmailNotifications = enableEmailNotifications;
        userToRegister.password = await this.hashPassword(password);

        await this.entityManager.persistAndFlush(userToRegister);

        delete (userToRegister as any).password;

        return userToRegister;
    }

    public async validateUser(username: string, password: string): Promise<User | null> {
        const user = await this.entityManager.findOne(
            User,
            { username: username.toLocaleLowerCase(), },
            { populate: ['password'] }
        );

        if (!user?.password || await bcrypt.compare(password, user.password) === false) {
            return null;
        }

        delete (user as any).password;

        return user;
    }

    private async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, this.configService.get('BCRYPT_HASH_SALT_ROUNDS'));
    }
}
