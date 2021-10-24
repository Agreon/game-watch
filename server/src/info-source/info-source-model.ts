import { Entity, Enum, IdentifiedReference, ManyToOne, Property } from "@mikro-orm/core";

import { Game } from "../game/game-model";
import { BaseEntity } from "../util/base-entity";

export enum InfoSourceType {
    Steam = "steam",
    Switch = "switch",
    PsStore = "psStore",
    Epic = "epic",
    Metacritic = "metacritic"
}

export interface BaseGameData {
    id: string;
    fullName: string;
    url: string;
}

export interface StoreGameData extends BaseGameData {
    thumbnailUrl?: string;
    releaseDate?: string;
}

export interface SteamGameData extends StoreGameData {
    priceInformation?: {
        initial: number;
        final: number;
        discountPercentage: number;
    };
    categories?: string[];
    genres?: string[];
    controllerSupport?: string;
}

export interface SwitchGameData extends StoreGameData {
    priceInformation?: {
        initial: string;
        final: string;
    };
}

export interface PsStoreGameData extends StoreGameData {
    priceInformation?: {
        initial: string;
        final: string;
        discountDescription?: string;
    };
}

export interface EpicGameData extends StoreGameData {
    priceInformation?: {
        initial: string;
        final: string;
    };
}

export interface MetacriticData extends BaseGameData {
    criticScore: string;
    userScore: string;
}

// TODO: What do these generics give us except for binding us to details?
export type GameData = {
    [InfoSourceType.Steam]: SteamGameData;
    [InfoSourceType.Switch]: SwitchGameData;
    [InfoSourceType.PsStore]: PsStoreGameData;
    [InfoSourceType.Epic]: EpicGameData;
    [InfoSourceType.Metacritic]: MetacriticData;
};
export type GameDataU = SteamGameData | SwitchGameData | PsStoreGameData | EpicGameData | MetacriticData;

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