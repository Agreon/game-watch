import { NotificationData, NotificationType } from "@game-watch/shared";
import { Entity, Enum, IdentifiedReference, ManyToOne, Property, Reference } from "@mikro-orm/core";

import { BaseEntity } from "../base-entity";
import { Game } from "./game-model";
import { InfoSource } from "./info-source-model";

@Entity()
export class Notification<T extends NotificationType = NotificationType> extends BaseEntity<Notification<T>> {
    @Enum(() => NotificationType)
    public type!: T;

    @Property()
    public read: boolean = false;

    @ManyToOne(() => Game, { wrappedReference: true })
    public game!: IdentifiedReference<Game>;

    @ManyToOne(() => InfoSource, { wrappedReference: true })
    public infoSource!: IdentifiedReference<InfoSource>;

    @Property({ columnType: "json" })
    public data!: NotificationData[T];

    public constructor(
        { type, data, game, infoSource }: { type: T, data: NotificationData[T], game: Game, infoSource: InfoSource }
    ) {
        super();
        this.type = type;
        this.data = data;
        this.game = Reference.create(game);
        this.infoSource = Reference.create(infoSource);
    }
}
