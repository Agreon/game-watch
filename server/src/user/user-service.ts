import { User } from "@game-watch/database";
import { UpdateUserSettingsDto } from "@game-watch/shared";
import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";


@Injectable()
export class UserService {
    public constructor(
        @InjectRepository(User)
        private readonly userRepository: EntityRepository<User>,
    ) { }

    public async updateUserSettings(userId: string, { country, interestedInSources }: UpdateUserSettingsDto): Promise<User> {
        const user = await this.userRepository.findOneOrFail(userId, { populate: ["infoSources"] });

        user.country = country;
        user.interestedInSources = interestedInSources;
        await this.userRepository.persistAndFlush(user);

        return user;
    }
}
