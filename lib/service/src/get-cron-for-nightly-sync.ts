import { Country } from '@game-watch/shared';

export const getCronForNightlySync = (country: Country): string => {
    switch (country) {
        case 'AT':
        case 'BE-FR':
        case 'BE-NL':
        case 'CH-DE':
        case 'CH-FR':
        case 'CH-IT':
        case 'DE':
        case 'ES':
        case 'FR':
        case 'GB':
        case 'IE':
        case 'IT':
        case 'NL':
        case 'PT':
        case 'RU':
        case 'ZA':
            return '0 1 * * *';
        case 'AU':
        case 'NZ':
            return '0 13 * * *';
        case 'US':
        default:
            return '0 18 * * *';
    }
};
