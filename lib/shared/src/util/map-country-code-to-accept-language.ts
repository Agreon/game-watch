import { Country } from '../types/country';

export const mapCountryCodeToAcceptLanguage = (country: Country): string => {
    switch (country) {
        case 'AT':
            return 'de-at';
        case 'DE':
            return 'de-de';
        case 'CH-DE':
            return 'de-ch';
        case 'FR':
            return 'fr-fr';
        case 'BE-FR':
            return 'fr-be';
        case 'CH-FR':
            return 'fr-ch';
        case 'NL':
            return 'nl';
        case 'BE-NL':
            return 'nl-be';
        case 'IT':
            return 'it-it';
        case 'CH-IT':
            return 'it-ch';
        case 'ES':
            return 'es-es';
        case 'PT':
            return 'pt-pt';
        case 'RU':
            return 'ru-ru';
        case 'AU':
            return 'en-au';
        case 'NZ':
            return 'en-nz';
        case 'US':
            return 'en-us';
        case 'GB':
            return 'en-gb';
        case 'IE':
            return 'en-ie';
        case 'ZA':
            return 'en-za';
    }
};
