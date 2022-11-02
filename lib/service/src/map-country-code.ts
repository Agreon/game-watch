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
