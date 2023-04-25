import { Country } from '../types/country';

const countryUnitMap: Record<Country, string> = {
    'AT': 'EUR',
    'BE-FR': 'EUR',
    'BE-NL': 'EUR',
    'CH-DE': 'CHF',
    'CH-FR': 'CHF',
    'CH-IT': 'CHF',
    'DE': 'EUR',
    'ES': 'EUR',
    'FR': 'EUR',
    'GB': 'GBP',
    'IE': 'EUR',
    'IT': 'EUR',
    'NL': 'EUR',
    'PT': 'EUR',
    'RU': 'RUB',
    'ZA': 'ZAR',
    'US': 'USD',
    'AU': 'AUD',
    'NZ': 'NZD',
};

export const formatPrice = ({ price, country }: { price?: number, country: Country }) => {
    if (price === undefined) {
        return 'TBA';
    }

    if (price === 0) {
        return 'Free';
    }

    return Intl.NumberFormat(country, {
        style: 'currency',
        currency: countryUnitMap[country]
    }).format(price);
};
