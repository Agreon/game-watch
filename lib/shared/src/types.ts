
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

interface PriceInformation {
    initial: string;
    final: string;
}

export interface StoreGameData extends BaseGameData {
    thumbnailUrl?: string;
    releaseDate?: string;
    priceInformation?: PriceInformation;
}

export interface SteamGameData extends StoreGameData {
    priceInformation?: PriceInformation & {
        discountPercentage: string;
    };
    categories?: string[];
    genres?: string[];
    controllerSupport?: string;
}

export type SwitchGameData = StoreGameData;

export interface PsStoreGameData extends StoreGameData {
    priceInformation?: PriceInformation & {
        discountDescription?: string;
    };
}

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

export enum NotificationType {
    NewStoreEntry = "new-store-entry",
    ReleaseDateChanged = "release-date-changed",
    GameReleased = "game-released",
    GameReduced = "game-reduced",
    NewMetacriticRating = "new-metacritic-rating"
}