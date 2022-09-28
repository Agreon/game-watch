import { Country } from '@game-watch/shared';

export const mapCountryCodeToLanguage = (country: Country) => {
    switch (country) {
        case 'DE':
            return 'de';
        case 'US':
        case 'AU':
        case 'NZ':
            return 'en';
    }
};

export const mapCountryCodeToAcceptLanguage = (country: Country) => {
    switch (country) {
        case 'DE':
            return 'de-DE';
        case 'US':
            return 'en-US';
        case 'AU':
            return 'en-AU';
        case 'NZ':
            return 'en-NZ';
    }
};
