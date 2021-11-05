
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
    priceInformation?: Record<string, string>;
}

export interface SteamGameData extends StoreGameData {
    priceInformation?: {
        initial: string;
        final: string;
        discountPercentage: string;
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
