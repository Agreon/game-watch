import { Country, InfoSourceType, UserState } from "@game-watch/shared";
import { ArrayType, Collection, Entity, Enum, OneToMany, Property } from "@mikro-orm/core";

import { BaseEntity } from "../base-entity";
import { Game } from "./game-model";
import { InfoSource } from "./info-source-model";
import { Tag } from "./tag-model";

@Entity()
export class User extends BaseEntity<User> {
    @Property({ unique: true, nullable: true })
    public username: string | null = null;

    @Property({ nullable: true, lazy: true })
    public password: string | null = null;

    @Property({ unique: true, nullable: true })
    public email: string | null = null;

    @Property({ default: false })
    public enableEmailNotifications: boolean = false;

    @Property({ default: false })
    public emailConfirmed: boolean = false;

    @Property({ unique: true, nullable: true, lazy: true })
    public emailConfirmationToken: string | null;

    @Enum(() => UserState)
    public state: UserState = UserState.Trial;

    @OneToMany(() => Game, game => game.user)
    public games = new Collection<Game>(this);

    @OneToMany(() => Tag, tag => tag.user)
    public tags = new Collection<Tag>(this);

    @OneToMany(() => InfoSource, infoSource => infoSource.user, { hidden: true })
    public infoSources = new Collection<InfoSource>(this);

    @Property()
    public lastTokenRefresh: Date = new Date();

    @Property({ type: ArrayType })
    public interestedInSources: InfoSourceType[] = [];

    @Property()
    public country: Country;

    public constructor({ id, country }: { id: string, country: Country }) {
        super();
        this.id = id;
        this.country = country;
    }

    public getEmailOrFail() {
        if (!this.email) {
            throw new Error("'email' was not set");
        }
        return this.email;
    }
}
