import { Country } from '../types/country';

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
