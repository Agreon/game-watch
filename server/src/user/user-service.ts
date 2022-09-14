import { Game, InfoSource, User } from "@game-watch/database";
import { InfoSourceState, InfoSourceType, UpdateUserSettingsDto } from "@game-watch/shared";
import { EntityManager, EntityRepository, Reference } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { v4 as uuidV4 } from "uuid";

import { MailService } from "../mail/mail-service";

@Injectable()
export class UserService {
    public constructor(
        @InjectRepository(User)
        private readonly userRepository: EntityRepository<User>,
        @InjectRepository(Game)
        private readonly gameRepository: EntityRepository<Game>,
        private readonly entityManager: EntityManager,
        private readonly mailService: MailService
    ) { }

    public async updateUserSettings(
        userId: string,
        { country, interestedInSources, email, enableEmailNotifications }: UpdateUserSettingsDto
    ): Promise<User> {
        const user = await this.userRepository.findOneOrFail(userId);
        const { newInfoSources, infoSourcesToRemove } = await this.getGameInfoSourcesUpdate(user, interestedInSources);

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
            em.remove(infoSourcesToRemove);
            em.persist(user);
            em.persist(newInfoSources);

            if (user.emailConfirmationToken) {
                await this.mailService.sendDoiMail(user, user.emailConfirmationToken);
            }
        });

        return user;
    }

    private async getGameInfoSourcesUpdate(user: User, newInterestedInSources: InfoSourceType[]) {
        const userGames = await this.gameRepository.find({ user }, { populate: ["infoSources"] });

        const newInterestIn = newInterestedInSources.filter(
            newType => user.interestedInSources.find(oldType => oldType === newType) === undefined
        );

        const newInfoSources = userGames.flatMap(game =>
            newInterestIn.map(
                type => new InfoSource({
                    type,
                    game,
                    user: Reference.create(user),
                    state: InfoSourceState.Initial,
                    data: null
                })
            )
        );

        const noMoreInterestIn = user.interestedInSources.filter(
            oldType => newInterestedInSources.find(newType => oldType === newType) === undefined
        );

        const infoSourcesToRemove = userGames.flatMap(game =>
            game.infoSources.getItems().filter(
                source =>
                    noMoreInterestIn.includes(source.type)
                    && [InfoSourceState.Initial, InfoSourceState.Disabled].includes(source.state)
            )
        );

        return {
            newInfoSources,
            infoSourcesToRemove
        };
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
