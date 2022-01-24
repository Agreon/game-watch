import { Collection, Entity, Enum, OneToMany, Property } from "@mikro-orm/core";

import { BaseEntity } from "../base-entity";
import { Game } from "./game-model";
import { Tag } from "./tag-model";

export enum UserState {
    Trial = "Trial",
    Registered = "Registered",
    Completed = "Completed",
    Disabled = "Disabled"
}

@Entity()
export class User extends BaseEntity<User> {
    @Property({ unique: true })
    public username!: string;

    @Property()
    public password!: string;

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
