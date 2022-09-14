import { User } from "@game-watch/database";
import { UpdateUserSettingsDto } from "@game-watch/shared";
import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { v4 as uuidV4 } from "uuid";

import { MailService } from "../mail/mail-service";

@Injectable()
export class UserService {
    public constructor(
        @InjectRepository(User)
        private readonly userRepository: EntityRepository<User>,
        private readonly entityManager: EntityManager,
        private readonly mailService: MailService
    ) { }

    public async updateUserSettings(
        userId: string,
        { country, interestedInSources, email, enableEmailNotifications }: UpdateUserSettingsDto
    ): Promise<User> {
        const user = await this.userRepository.findOneOrFail(userId);

        if (user.email !== email) {
            user.emailConfirmed = false;
        }
        user.enableEmailNotifications = enableEmailNotifications;
        user.email = email ?? null;
        user.country = country;
        if (user.emailConfirmed === false && !!user.email) {
            user.emailConfirmationToken = uuidV4();
        }

        user.interestedInSources = interestedInSources;

        await this.entityManager.transactional(async em => {
            em.persist(user);

            if (user.emailConfirmationToken) {
                await this.mailService.sendDoiMail(user, user.emailConfirmationToken);
            }
        });

        return user;
    }

    public async confirmEmailAddress(token: string) {
        const user = await this.userRepository.findOneOrFail({ emailConfirmationToken: token });

        user.emailConfirmationToken = null;
        user.emailConfirmed = true;

        await this.userRepository.persistAndFlush(user);
    }

    public async unsubscribeFromNotifications(userId: string) {
        const user = await this.userRepository.findOneOrFail(userId);

        user.emailConfirmed = false;

        await this.userRepository.persistAndFlush(user);
    }
}
