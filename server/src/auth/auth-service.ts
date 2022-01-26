import { User } from "@game-watch/database";
import { CreateUserDto, RegisterUserDto, UserState } from "@game-watch/shared";
import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import bcrypt from 'bcrypt';

import { Environment } from "../environment";

@Injectable()
export class AuthService {
    public constructor(
        @InjectRepository(User)
        private readonly userRepository: EntityRepository<User>,
        private readonly configService: ConfigService<Environment, true>
    ) { }

    public async createUser({ id }: CreateUserDto): Promise<User> {
        const user = new User({ id });
        await this.userRepository.persistAndFlush(user);

        return user;
    }

    public async registerUser({ id, username, password }: RegisterUserDto): Promise<User> {
        const userToRegister = await this.userRepository.findOneOrFail(id);

        userToRegister.username = username;
        userToRegister.state = UserState.Registered;
        userToRegister.password = await this.hashPassword(password);

        await this.userRepository.persistAndFlush(userToRegister);

        return userToRegister;
    }

    public async validateUser(username: string, password: string): Promise<User | null> {
        const userWithEmail = await this.userRepository.findOneOrFail({ username });

        if (userWithEmail.password !== await this.hashPassword(password)) {
            return null;
        }

        return userWithEmail;
    }

    private async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, this.configService.get("BCRYPT_HASH_SALT_ROUNDS"));
    }
}
