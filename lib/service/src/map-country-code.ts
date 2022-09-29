import { Country } from '@game-watch/shared';

export const mapCountryCodeToLanguage = (country: Country): string => {
    switch (country) {
        case 'DE':
        case 'AT':
        case 'CH-DE':
            return 'de';
        case 'US':
        case 'AU':
        case 'NZ':
        default:
            return 'en';
    }
};

// TODO: Only correct for steam
export const mapCountryCodeToAcceptLanguage = (country: Country): string => {
    switch (country) {
        case 'DE':
        case 'AT':
        case 'CH-DE':
            return 'de-DE';
        case 'FR':
        case 'BE-FR':
        case 'CH-FR':
        case 'CA-FR':
            return 'fr';
        case 'IT':
        case 'CH-IT':
            return 'it';
        case 'ES':
            return 'es';
        case 'TR':
            return 'tr';
        case 'AR-ES':
        case 'CL-ES':
        case 'CO-ES':
        case 'MX-ES':
        case 'PE-ES':
            return country.split('-')[1].toLowerCase() + '-' + country.split('-')[0];
        case 'PT':
            return 'pt';
        case 'BR-PT':
            return 'pt-BR';
        case 'US':
        case 'NZ':
        case 'AU':
        case 'ZA':
        case 'CA-EN':
        default:
            return 'en-US';
        case 'AU':
            return 'en-AU';
        case 'NZ':
            return 'en-NZ';
    }
};
