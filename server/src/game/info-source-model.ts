import { BaseEntity, Entity, Enum, IdentifiedReference, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from 'uuid';
import { Game } from "./game-model";

export enum InfoSourceType {
    Steam = "steam",
    Nintendo = "nintendo",
    PsStore = "psStore",
}

export interface StoreGameData {
    id: string;
    fullName: string;
    storeUrl: string;
}

export interface SteamGameData extends StoreGameData {
    thumbnailUrl: string;
    releaseDate: {
        comingSoon: boolean;
        date: Date;
    };
    priceInformation?: {
        initial: number;
        final: number;
        discountPercentage: number;
    };
    categories?: string[];
    genres?: string[];
    controllerSupport?: string;
}

export interface NintendoGameData extends StoreGameData {
    priceInformation?: {
        initial: string;
        final: string;
    };
    releaseDate: string;
}

export interface PsStoreGameData extends StoreGameData {
    priceInformation?: {
        initial: string;
        final: string;
        discountDescription?: string;
    };
    releaseDate?: string;
}

// TODO: What do these generics give us except for binding us to details?
export type GameData = {
    [InfoSourceType.Steam]: SteamGameData;
    [InfoSourceType.Nintendo]: NintendoGameData;
    [InfoSourceType.PsStore]: PsStoreGameData;
}
export type GameDataU = SteamGameData | NintendoGameData | PsStoreGameData;

@Entity()
export class InfoSource<T extends InfoSourceType = InfoSourceType> extends BaseEntity<InfoSource, "id"> {
    @PrimaryKey()
    public id: string = v4();

    @Property()
    public createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    public updatedAt: Date = new Date();

    @Enum(() => InfoSourceType)
    public type!: T;

    @Property()
    public remoteGameId: string;

    @Property({ columnType: "json" })
    public data!: GameData[T];

    @ManyToOne(() => Game, { wrappedReference: true })
    public game!: IdentifiedReference<Game>;

    public constructor({ type, remoteGameId, data }: { type: T, remoteGameId: string, data: GameData[T] }) {
        super();
        this.type = type;
        this.remoteGameId = remoteGameId;
        this.data = data;
    }
}