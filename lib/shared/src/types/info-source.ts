export enum InfoSourceType {
    Steam = "steam",
    Switch = "switch",
    PsStore = "psStore",
    Epic = "epic",
    Metacritic = "metacritic"
}
export type StoreInfoSource = InfoSourceType.Steam | InfoSourceType.Switch | InfoSourceType.PsStore | InfoSourceType.Epic;

export interface BaseGameData {
    id: string;
    fullName: string;
    url: string;
}

export interface StorePriceInformation {
    initial?: number;
    final: number;
}

export interface StoreGameData extends BaseGameData {
    thumbnailUrl?: string;
    releaseDate?: Date;
    priceInformation?: StorePriceInformation;
}

export interface SteamGameData extends StoreGameData {
    categories?: string[];
    genres?: string[];
    controllerSupport?: string;
}

export type SwitchGameData = StoreGameData;

export type PsStoreGameData = StoreGameData;

export type EpicGameData = StoreGameData;

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
