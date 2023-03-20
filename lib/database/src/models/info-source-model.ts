import { Country, InfoSourceData, InfoSourceState, InfoSourceType } from '@game-watch/shared';
import {
    ArrayType,
    Collection,
    Entity,
    Enum,
    IdentifiedReference,
    ManyToOne,
    OneToMany,
    Property,
    Reference,
    Unique,
} from '@mikro-orm/core';

import { BaseEntity } from '../base-entity';
import { Game } from './game-model';
import { Notification } from './notification-model';
import { User } from './user-model';

interface InfoSourceParams<
    T extends InfoSourceType = InfoSourceType,
    S extends InfoSourceState = InfoSourceState
> {
    type: T
    state: S
    user: IdentifiedReference<User>
    data: InfoSourceData<T, S>
    excludedRemoteGameIds?: string[]
    game?: Game
    country: Country
}

@Entity()
@Unique({ properties: ['type', 'game'] })
export class InfoSource<
    T extends InfoSourceType = InfoSourceType,
    S extends InfoSourceState = InfoSourceState
> extends BaseEntity<InfoSource> {
    @Enum({ items: () => InfoSourceType, type: "string" })
    public type!: T;

    @Enum({ items: () => InfoSourceState, type: "string" })
    public state!: S;

    @Property()
    public continueSearching: boolean = false;

    @Property({ type: ArrayType })
    public excludedRemoteGameIds: string[] = [];

    @Property({ columnType: 'json', nullable: true })
    public data: InfoSourceData<T, S>;

    // This property is necessary because we reuse the info source model and the notification logic
    // depends on this information.
    @Property()
    public foundAt: Date = new Date();

    @Property()
    public country: Country;

    @ManyToOne(() => Game, { wrappedReference: true, hidden: true, onDelete: 'cascade' })
    public game!: IdentifiedReference<Game>;

    @ManyToOne(() => User, { wrappedReference: true, onDelete: 'cascade' })
    public user!: IdentifiedReference<User>;

    @OneToMany(() => Notification, notification => notification.infoSource)
    public notifications = new Collection<Notification, InfoSource<T, S>>(this);

    public constructor(
        {
            type,
            state,
            excludedRemoteGameIds,
            data,
            game,
            user,
            country,
        }: InfoSourceParams<T, S>
    ) {
        super();
        this.type = type;
        this.state = state;
        this.excludedRemoteGameIds = excludedRemoteGameIds ?? [];
        this.user = user;
        this.data = data;
        this.country = country;
        if (game) {
            this.game = Reference.create(game);
        }
    }

    public getDataOrFail() {
        if (!this.data) {
            throw new Error("'data' is not set");
        }

        return this.data;
    }
}
