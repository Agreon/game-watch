import { GameData, InfoSourceType } from "@game-watch/shared";
import { Collection, Entity, Enum, IdentifiedReference, ManyToOne, OneToMany, Property, Reference } from "@mikro-orm/core";

import { BaseEntity } from "../base-entity";
import { Game } from "./game-model";
import { Notification } from "./notification-model";

@Entity()
export class InfoSource<T extends InfoSourceType = InfoSourceType> extends BaseEntity<InfoSource> {
    @Enum(() => InfoSourceType)
    public type!: T;

    @Property()
    public remoteGameId: string;

    @Property()
    public syncing: boolean = true;

    @Property()
    public disabled: boolean = false;

    @Property()
    public resolveError: boolean = false;

    @Property({ columnType: "json", nullable: true })
    public data: GameData[T] | null = null;

    @ManyToOne(() => Game, { wrappedReference: true })
    public game!: IdentifiedReference<Game>;

    @OneToMany(() => Notification, notification => notification.infoSource)
    public notifications = new Collection<Notification, InfoSource<T>>(this);

    public constructor(
        { type, remoteGameId, data, game }: { type: T, remoteGameId: string, data?: GameData[T], game?: Game }
    ) {
        super();
        this.type = type;
        this.remoteGameId = remoteGameId;
        this.data = data ?? null;
        if (game) {
            this.game = Reference.create(game);
        }
    }
}
