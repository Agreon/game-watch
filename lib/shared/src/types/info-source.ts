import { Countries, Country } from './country';

export enum InfoSourceType {
    Steam = 'steam',
    Switch = 'switch',
    Playstation = 'playstation',
    Epic = 'epic',
    Metacritic = 'metacritic',
    Proton = 'proton'
}
export type StoreInfoSource =
    | InfoSourceType.Steam
    | InfoSourceType.Switch
    | InfoSourceType.Playstation
    | InfoSourceType.Epic;

export const StoreInfoSources = [
    InfoSourceType.Steam,
    InfoSourceType.Switch,
    InfoSourceType.Playstation,
    InfoSourceType.Epic,
];

export enum InfoSourceState {
    Found = 'Found',
    Resolved = 'Resolved',
    Error = 'Error',
    Disabled = 'Disabled'
}

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
    thumbnailUrl: string;
    releaseDate?: Date;
    originalReleaseDate?: string;
    priceInformation?: StorePriceInformation;
}

export interface SteamGameData extends StoreGameData {
    isEarlyAccess: boolean;
}

export type SwitchGameData = StoreGameData;

export type PlaystationGameData = StoreGameData;

export type EpicGameData = StoreGameData;

export interface MetacriticData extends BaseGameData {
    criticScore: string;
    userScore: string;
}

export type ProtonDbScore = 'native' | 'platinum' | 'gold' | 'silver' | 'bronze' | 'borked';

export type DeckVerified = 'verified' | 'playable' | 'unsupported';

export interface ProtonGameData extends BaseGameData {
    score: ProtonDbScore;
    deckVerified: DeckVerified;
    thumbnailUrl: string;
}

// TODO: What do these generics give us except for binding us to details?
export type GameData = {
    [InfoSourceType.Steam]: SteamGameData;
    [InfoSourceType.Switch]: SwitchGameData;
    [InfoSourceType.Playstation]: PlaystationGameData;
    [InfoSourceType.Epic]: EpicGameData;
    [InfoSourceType.Metacritic]: MetacriticData;
    [InfoSourceType.Proton]: ProtonGameData;
};
export type AnyGameData =
    | SteamGameData
    | SwitchGameData
    | PlaystationGameData
    | EpicGameData
    | MetacriticData
    | ProtonGameData;

export const SupportedCountries: Record<InfoSourceType, readonly Country[]> = {
    [InfoSourceType.Steam]: Countries,
    [InfoSourceType.Metacritic]: Countries,
    [InfoSourceType.Proton]: Countries,
    [InfoSourceType.Switch]: Countries.filter(country => country !== 'RU'),
    [InfoSourceType.Playstation]: Countries.filter(country => country !== 'RU'),
    // Currently, it is not clear how epic determines the user origin and therefore the currencies.
    [InfoSourceType.Epic]: [] as const,
} as const;

export const InfoSourceTypeNames: Record<InfoSourceType, string> = {
    [InfoSourceType.Steam]: 'Steam',
    [InfoSourceType.Switch]: 'Switch',
    [InfoSourceType.Playstation]: 'PS Store',
    [InfoSourceType.Epic]: 'Epic',
    [InfoSourceType.Metacritic]: 'Metacritic',
    [InfoSourceType.Proton]: 'ProtonDB',
};
