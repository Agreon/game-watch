import { Country } from '../types/country';

const countryUnitMap: Record<Country, string> = {
    'AT': '€',
    'BE-FR': '€',
    'BE-NL': '€',
    'CH-DE': 'CHF',
    'CH-FR': 'CHF',
    'CH-IT': 'CHF',
    'DE': '€',
    'ES': '€',
    'FR': '€',
    'GB': '£',
    'IE': '€',
    'IT': '€',
    'NL': '€',
    'PT': '€',
    'RU': 'pуб.',
    'ZA': 'R',
    'US': '$',
    'AU': '$',
    'NZ': '$',
};

export const formatPrice = ({ price, country }: { price?: number, country: Country }) => {
    if (price === undefined) {
        return 'TBA';
    }

    if (price === 0) {
        return 'Free';
    }

    if ([
        '$',
        'CHF',
        'R',
        '£'
    ].includes(countryUnitMap[country])) {
        return `${countryUnitMap[country]}${price}`;
    }

    return `${price}${countryUnitMap[country]}`;
};
