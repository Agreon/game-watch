import { InfoSourceData, InfoSourceState, InfoSourceType } from "@game-watch/shared";
import { ArrayType, Collection, Entity, Enum, IdentifiedReference, ManyToOne, OneToMany, Property, Reference, Unique } from "@mikro-orm/core";

import { BaseEntity } from "../base-entity";
import { Game } from "./game-model";
import { Notification } from "./notification-model";
import { User } from "./user-model";

interface InfoSourceParams<T extends InfoSourceType = InfoSourceType, S extends InfoSourceState = InfoSourceState> {
    type: T
    state: S
    user: IdentifiedReference<User>
    data: InfoSourceData<T, S>
    excludedRemoteGameIds?: string[]
    game?: Game
}

@Entity()
@Unique({ properties: ["type", "game"] })
export class InfoSource<T extends InfoSourceType = InfoSourceType, S extends InfoSourceState = InfoSourceState> extends BaseEntity<InfoSource> {
    @Enum(() => InfoSourceType)
    public type!: T;

    @Enum(() => InfoSourceState)
    public state!: S;

    @Property()
    public syncing: boolean = true;

    @Property({ type: ArrayType })
    public excludedRemoteGameIds: string[] = [];

    @Property({ columnType: "json", nullable: true })
    public data: InfoSourceData<T, S>;

    // This property is necessary because we reuse the info source model and the notification logic
    // depends on this information.
    @Property()
    public foundAt: Date = new Date();

    @ManyToOne(() => Game, { wrappedReference: true, hidden: true })
    public game!: IdentifiedReference<Game>;

    @ManyToOne(() => User, { wrappedReference: true })
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
        }: InfoSourceParams<T, S>
    ) {
        super();
        this.type = type;
        this.state = state;
        this.excludedRemoteGameIds = excludedRemoteGameIds ?? [];
        this.user = user;
        this.data = data;
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
