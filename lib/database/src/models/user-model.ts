import { UserState } from "@game-watch/shared";
import { Collection, Entity, Enum, OneToMany, Property } from "@mikro-orm/core";

import { BaseEntity } from "../base-entity";
import { Game } from "./game-model";
import { Tag } from "./tag-model";

@Entity()
export class User extends BaseEntity<User> {
    @Property({ unique: true, nullable: true })
    public username: string | null = null;

    @Property({ nullable: true, lazy: true })
    public password: string | null = null;

    @Enum(() => UserState)
    public state: UserState = UserState.Trial;

    @OneToMany(() => Game, game => game.user)
    public games = new Collection<Game>(this);

    @OneToMany(() => Tag, tag => tag.user)
    public tags = new Collection<Tag>(this);

    @Property()
    public lastTokenRefresh: Date = new Date();

    public constructor({ id }: { id: string }) {
        super();
        this.id = id;
    }
}
