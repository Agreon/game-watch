import { UserState } from "@game-watch/shared";
import { Collection, Entity, Enum, OneToMany, Property } from "@mikro-orm/core";

import { BaseEntity } from "../base-entity";
import { Game } from "./game-model";
import { Tag } from "./tag-model";

@Entity()
export class User extends BaseEntity<User> {
    @Property({ unique: true, nullable: true })
    public username: string | null = null;

    // TODO: Don't return on default query
    @Property({ nullable: true })
    public password: string | null = null;

    @Enum(() => UserState)
    public state: UserState = UserState.Trial;

    @OneToMany(() => Game, game => game.user)
    public games = new Collection<Game>(this);

    @OneToMany(() => Tag, tag => tag.user)
    public tags = new Collection<Tag>(this);

    public constructor({ id }: { id: string }) {
        super();
        this.id = id;
    }
}
