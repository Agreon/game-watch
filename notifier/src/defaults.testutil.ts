import { Logger } from '@game-watch/service';
import { SteamGameData } from '@game-watch/shared';

export const DEFAULT_STEAM_DATA: SteamGameData = {
    id: '1811990',
    fullName: 'Wildfrost',
    isEarlyAccess: false,
    thumbnailUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/1811990/header.jpg?t=1680199544',
    url: 'https://store.steampowered.com/app/1811990',
};

export const TEST_LOGGER = {
    debug: () => { }
} as unknown as Logger;
