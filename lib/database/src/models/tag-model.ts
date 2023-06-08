import {
    Collection,
    Entity,
    Ref,
    ManyToMany,
    ManyToOne,
    Property,
} from '@mikro-orm/core';

import { BaseEntity } from '../base-entity';
import { Game } from './game-model';
import { User } from './user-model';

@Entity()
export class Tag extends BaseEntity<Tag> {
    @Property()
    public name!: string;

    @Property()
    public color!: string;

    @ManyToMany(() => Game, game => game.tags)
    public games = new Collection<Game>(this);

    @ManyToOne(() => User, { wrappedReference: true, onDelete: 'cascade' })
    public user!: Ref<User>;

    public constructor(
        { name, color, user }: { name: string, color: string, user: Ref<User> }) {

        super();
        this.name = name;
        this.color = color;
        this.user = user;
    }
}
