import { Collection, Entity, OneToMany, Property } from "@mikro-orm/core";

import { Game } from "../game/game-model";
import { Tag } from "../tag/tag-model";
import { BaseEntity } from "../util/base-entity";

@Entity()
export class User extends BaseEntity<User> {
    // TODO: unique
    @Property()
    public email!: string;

    @Property()
    public password!: string;

    @OneToMany(() => Game, game => game.user)
    public games = new Collection<Game>(this);

    @OneToMany(() => Tag, tag => tag.user)
    public tags = new Collection<Tag>(this);

    public constructor({ email, password }: { email: string, password: string }) {
        super();
        this.email = email;
        this.password = password;
    }

}