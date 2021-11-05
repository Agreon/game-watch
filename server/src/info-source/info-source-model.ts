import { Entity, Enum, IdentifiedReference, ManyToOne, Property } from "@mikro-orm/core";
import { GameData, InfoSourceType } from "game-watch-shared";

import { Game } from "../game/game-model";
import { BaseEntity } from "../util/base-entity";


@Entity()
export class InfoSource<T extends InfoSourceType = InfoSourceType> extends BaseEntity<InfoSource> {
    @Enum(() => InfoSourceType)
    public type!: T;

    @Property()
    public remoteGameId: string;

    @Property()
    public disabled: boolean = false;

    @Property()
    public resolveError: boolean = false;

    @Property({ columnType: "json", nullable: true })
    public data: GameData[T] | null = null;

    @ManyToOne(() => Game, { wrappedReference: true })
    public game!: IdentifiedReference<Game>;

    public constructor(
        { type, remoteGameId, data }: { type: T, remoteGameId: string, data?: GameData[T] }
    ) {
        super();
        this.type = type;
        this.remoteGameId = remoteGameId;
        this.data = data ?? null;
    }
}