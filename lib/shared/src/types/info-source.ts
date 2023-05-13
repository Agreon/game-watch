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

export type StoreReleaseDateInformation =
    {
        isExact: true,
        date: Date
    }
    | {
        isExact: false,
        date: string
    }

export interface StoreGameData extends BaseGameData {
    thumbnailUrl: string;
    isEarlyAccess?: boolean;
    releaseDate?: StoreReleaseDateInformation;
    priceInformation?: StorePriceInformation;
}

export interface MetacriticData extends BaseGameData {
    criticScore: string;
    userScore: string;
}

export type ProtonDbScore = 'native' | 'platinum' | 'gold' | 'silver' | 'bronze' | 'borked';

export type DeckVerified = 'verified' | 'playable' | 'unsupported' | 'unknown';

export interface ProtonGameData extends BaseGameData {
    score: ProtonDbScore;
    deckVerified: DeckVerified;
    thumbnailUrl: string;
}

export type GameData = {
    [InfoSourceType.Steam]: StoreGameData;
    [InfoSourceType.Switch]: StoreGameData;
    [InfoSourceType.Playstation]: StoreGameData;
    [InfoSourceType.Epic]: StoreGameData;
    [InfoSourceType.Metacritic]: MetacriticData;
    [InfoSourceType.Proton]: ProtonGameData;
};
export type AnyGameData =
    | StoreGameData
    | MetacriticData
    | ProtonGameData;

export const SupportedCountries: Record<InfoSourceType, readonly Country[]> = {
    [InfoSourceType.Steam]: Countries,
    [InfoSourceType.Metacritic]: Countries,
    [InfoSourceType.Proton]: Countries,
    [InfoSourceType.Switch]: Countries.filter(country => country !== 'RU'),
    [InfoSourceType.Playstation]: Countries.filter(country => country !== 'RU'),
    [InfoSourceType.Epic]: Countries,
} as const;

export const InfoSourceTypeNames: Record<InfoSourceType, string> = {
    [InfoSourceType.Steam]: 'Steam',
    [InfoSourceType.Switch]: 'Switch',
    [InfoSourceType.Playstation]: 'PS Store',
    [InfoSourceType.Epic]: 'Epic',
    [InfoSourceType.Metacritic]: 'Metacritic',
    [InfoSourceType.Proton]: 'ProtonDB',
};
