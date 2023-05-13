import { Logger } from '@game-watch/service';
import { BaseGameData, ProtonGameData, StoreGameData } from '@game-watch/shared';

export const DEFAULT_BASE_GAME_DATA: BaseGameData = {
    id: '1811990',
    fullName: 'Wildfrost',
    url: 'https://store.steampowered.com/app/1811990'
};

export const DEFAULT_STEAM_DATA: StoreGameData = {
    id: '1811990',
    fullName: 'Wildfrost',
    isEarlyAccess: false,
    thumbnailUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/1811990/header.jpg?t=1680199544',
    url: 'https://store.steampowered.com/app/1811990',
};

export const DEFAULT_PROTON_DATA: ProtonGameData = {
    id: '970830',
    fullName: 'The Dungeon Of Naheulbeuk',
    url: 'https://www.protondb.com/app/970830',
    thumbnailUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/970830/header.jpg?t=1676283366',
    score: 'gold',
    deckVerified: 'playable',
};

export const TEST_LOGGER = {
    debug: () => { }
} as unknown as Logger;
