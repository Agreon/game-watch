import { GameData, InfoSourceState, InfoSourceType } from "@game-watch/shared";
import { ArrayType, Collection, Entity, Enum, IdentifiedReference, ManyToOne, OneToMany, Property, Reference, Unique } from "@mikro-orm/core";

import { BaseEntity } from "../base-entity";
import { Game } from "./game-model";
import { Notification } from "./notification-model";
import { User } from "./user-model";

// TODO: Make nullables optional
type InfoSourceParams<T extends InfoSourceType = InfoSourceType, S extends InfoSourceState = InfoSourceState> = {
    type: T;
    state: S;
    user: IdentifiedReference<User>;
    remoteGameId: S extends InfoSourceState.Found | InfoSourceState.Resolved ? string : null;
    remoteGameName: S extends InfoSourceState.Found | InfoSourceState.Resolved ? string : null;
    data: S extends InfoSourceState.Resolved ? GameData[T] : null;
    excludedRemoteGameIds?: string[];
    game?: Game;
}

@Entity()
@Unique({ properties: ["type", "game"] })
export class InfoSource<T extends InfoSourceType = InfoSourceType, S extends InfoSourceState = InfoSourceState> extends BaseEntity<InfoSource> {
    @Enum(() => InfoSourceType)
    public type!: T;

    @Enum(() => InfoSourceState)
    public state!: S;

    @Property({ nullable: true })
    public remoteGameId: S extends (InfoSourceState.Found | InfoSourceState.Resolved) ? string : null;

    @Property({ nullable: true })
    public remoteGameName: S extends (InfoSourceState.Found | InfoSourceState.Resolved) ? string : null;

    @Property()
    public syncing: boolean = true;

    @Property({ type: ArrayType })
    public excludedRemoteGameIds: string[] = [];

    @Property({ columnType: "json", nullable: true })
    public data: S extends InfoSourceState.Resolved ? GameData[T] : null;

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
            remoteGameId,
            remoteGameName,
            excludedRemoteGameIds,
            data,
            game,
            user,
        }: InfoSourceParams<T, S>
    ) {
        super();
        this.type = type;
        this.state = state;
        this.remoteGameId = remoteGameId;
        this.remoteGameName = remoteGameName;
        this.excludedRemoteGameIds = excludedRemoteGameIds ?? [];
        this.user = user;
        this.data = data;
        if (game) {
            this.game = Reference.create(game);
        }
    }

    public getRemoteGameIdOrFail() {
        if (!this.remoteGameId) {
            throw new Error("'remoteGameId' is not set");
        }

        return this.remoteGameId;
    }

    public getDataOrFail() {
        if (!this.data) {
            throw new Error("'data' is not set");
        }

        return this.data;
    }
}
