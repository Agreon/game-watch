import { NotificationType } from "@game-watch/shared";
import { Entity, Enum, IdentifiedReference, ManyToOne, Property, Reference } from "@mikro-orm/core";

import { BaseEntity } from "../base-entity";
import { Game } from "./game-model";
import { InfoSource } from "./info-source-model";

// TODO: Do we need extra data?
@Entity()
export class Notification extends BaseEntity<Notification> {
    @Enum(() => NotificationType)
    public type!: NotificationType;

    @Property()
    public read: boolean = false;

    @ManyToOne(() => Game, { wrappedReference: true })
    public game!: IdentifiedReference<Game>;

    @ManyToOne(() => InfoSource, { wrappedReference: true })
    public infoSource!: IdentifiedReference<InfoSource>;

    public constructor(
        { type, game, infoSource }: { type: NotificationType, game: Game, infoSource: InfoSource }
    ) {
        super();
        this.type = type;
        this.game = Reference.create(game);
        this.infoSource = Reference.create(infoSource);
    }
}