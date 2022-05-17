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
    originalReleaseDate?: string;
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

export const Countries = ["DE", "US"] as const;
export type Country = typeof Countries[number];

export const SupportedCountries: Record<InfoSourceType, readonly Country[]> = {
    [InfoSourceType.Steam]: ["DE", "US"] as const,
    [InfoSourceType.PsStore]: ["DE", "US"] as const,
    [InfoSourceType.Metacritic]: ["DE", "US"] as const,
    // Currently, it is not clear how epic determines the user origin and therefore the currencies.
    [InfoSourceType.Epic]: ["DE"] as const,
    // At least the US store is built completely different
    [InfoSourceType.Switch]: ["DE"] as const,
} as const;
