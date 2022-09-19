import { Country } from '@game-watch/shared';

export const mapCountryCodeToLanguage = (country: Country) => {
    switch (country) {
        case 'DE':
            return 'de';
        case 'US':
            return 'en';
    }
};

export const mapCountryCodeToAcceptLanguage = (country: Country) => {
    switch (country) {
        case 'DE':
            return 'de-DE';
        case 'US':
            return 'en-US';
    }
};
