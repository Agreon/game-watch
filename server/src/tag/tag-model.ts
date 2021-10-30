import { Collection, Entity, IdentifiedReference, ManyToMany, ManyToOne, Property, wrap } from "@mikro-orm/core";

import { User } from "../auth/user-model";
import { Game } from "../game/game-model";
import { BaseEntity } from "../util/base-entity";

@Entity()
export class Tag extends BaseEntity<Tag> {
    @Property()
    public name!: string;

    @Property()
    public color!: string;

    @ManyToMany(() => Game, game => game.tags)
    public games = new Collection<Game>(this);

    @ManyToOne(() => User, { wrappedReference: true })
    public user!: IdentifiedReference<User>;

    public constructor({ name, color, user }: { name: string, color: string, user: User }) {
        super();
        this.name = name;
        this.color = color;
        this.user = wrap(user).toReference();
    }
}
