import { User } from "@game-watch/database";
import { UpdateUserSettingsDto } from "@game-watch/shared";
import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { v4 as uuidV4 } from "uuid";

import { MailService } from "../mail/mail-service";

@Injectable()
export class UserService {
    public constructor(
        @InjectRepository(User)
        private readonly userRepository: EntityRepository<User>,
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
        user.interestedInSources = interestedInSources;

        await this.userRepository.persistAndFlush(user);

        if (user.emailConfirmed === false && !!user.email) {
            user.emailConfirmationToken = uuidV4();

            // Persist again, to not send an invalid token if something failed.
            await this.userRepository.persistAndFlush(user);

            await this.mailService.sendDoiMail(user, user.emailConfirmationToken);
        }

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
        user.enableEmailNotifications = false;

        await this.userRepository.persistAndFlush(user);
    }
}
