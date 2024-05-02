import {
    Collection,
    Entity,
    ManyToMany,
    ManyToOne,
    Property,
    Ref,
} from '@mikro-orm/core';

import { BaseEntity } from '../base-entity';
import { Game } from './game-model';
import { User } from './user-model';

@Entity()
export class Tag extends BaseEntity {
    @Property()
    public name!: string;

    @Property()
    public color!: string;

    @ManyToMany(() => Game, game => game.tags)
    public games = new Collection<Game>(this);

    @ManyToOne(() => User, { ref: true, deleteRule: 'cascade' })
    public user!: Ref<User>;

    public constructor(
        { name, color, user }: { name: string, color: string, user: Ref<User> }) {

        super();
        this.name = name;
        this.color = color;
        this.user = user;
    }
}
