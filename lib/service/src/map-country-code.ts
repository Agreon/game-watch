import { Country } from '@game-watch/shared';

export const mapCountryCodeToLanguage = (country: Country): string => {
    switch (country) {
        case 'DE':
        case "CH-DE":
            return 'de';
        case 'US':
        case 'ZA':
        case 'AU':
        case "NZ":
        default:
            // Is this good enough for steam? I don't think so
            // => Maybe we should move that methods into the services
            return 'en';
    }
};

export const mapCountryCodeToAcceptLanguage = (country: Country): string => {
    switch (country) {
        case 'DE':
            return 'de-DE';
        case "CH-DE":
            return "ch-DE";
        case 'US':
        case "NZ":
        case "AU":
        case "ZA":
        default:
            return 'en-US';
    }
};
