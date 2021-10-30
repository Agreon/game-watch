import { EntityRepository } from "@mikro-orm/knex";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";

import { User } from "./user-model";

@Injectable()
export class UserService {
    public constructor(
        @InjectRepository(User)
        private readonly userRepository: EntityRepository<User>
    ) { }

    public async createUser(params: ConstructorParameters<typeof User>[0]) {
        return await this.userRepository.persistAndFlush(new User(params));
    }

    public async getUserOrFail(id: string) {
        return await this.userRepository.findOneOrFail(id);
    }
}