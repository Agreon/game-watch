import {
    Collection,
    Entity,
    ManyToMany,
    ManyToOne,
    OneToMany,
    Property,
    Ref,
} from '@mikro-orm/core';

import { BaseEntity } from '../base-entity';
import { InfoSource } from './info-source-model';
import { Notification } from './notification-model';
import { Tag } from './tag-model';
import { User } from './user-model';

@Entity()
export class Game extends BaseEntity<Game> {
    @Property()
    public search!: string;

    @Property({ type: 'string', nullable: true })
    public name: string | null;

    @Property()
    public syncing: boolean = true;

    @Property()
    public setupCompleted: boolean = false;

    @Property()
    public continueSearching: boolean = true;

    @Property()
    public description: string = '';

    @OneToMany(() => InfoSource, infoSource => infoSource.game)
    public infoSources = new Collection<InfoSource, Game>(this);

    @OneToMany(() => Notification, notification => notification.game)
    public notifications = new Collection<Notification, Game>(this);

    @ManyToMany(() => Tag)
    public tags = new Collection<Tag, Game>(this);

    @ManyToOne(() => User, { wrappedReference: true, onDelete: 'cascade' })
    public user!: Ref<User>;

    public constructor({ search, user }: { search: string, user: Ref<User> }) {
        super();
        this.search = search;
        this.user = user;
    }
}
