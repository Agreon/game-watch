import { Country } from '../types/country';

const countryUnitMap: Record<Country, string> = {
    'AR-ES': '$',
    'AT': '€',
    'AU': '$',
    'BE-FR': '€',
    'BE-NL': '€',
    'BG': '€',
    'BR-PT': 'R$',
    'CA-EN': '$',
    'CA-FR': '$',
    'CH-DE': 'CHF ',
    'CH-FR': '$',
    'CH-IT': '$',
    'CL-ES': '$',
    'CO-ES': '$',
    'CZ': '€',
    'DE': '€',
    'DK': '€',
    'EE': '€',
    'ES': '€',
    'FI': '€',
    'FR': '€',
    'GR': '€',
    'HK': '$',
    'HR': '€',
    'HU': '€',
    'IE': '€',
    'IT': '€',
    'JP': '¥ ',
    'KR': '₩ ',
    'MX-ES': '$',
    'MY': 'RM',
    'NL': '€',
    'NO': '€',
    'NZ': '$',
    'PE-ES': '$',
    'PH': 'P',
    'PL': '€',
    'PT': '€',
    'RO': '€',
    'RU': 'pуб.',
    'SE': '€',
    'SI': '€',
    'SG': '$',
    'SK': '€',
    'TH': '฿',
    'TR': 'TL',
    'TW': '$',
    'UK': '£',
    'US': '$',
    'ZA': 'R ',
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
        'R$',
        'R ',
        'RM',
        'P',
        '฿',
        'CHF ',
        '£',
        '¥ ',
        '₩ ',
    ].includes(countryUnitMap[country])) {
        return `${countryUnitMap[country]}${price}`;
    }

    return `${price}${countryUnitMap[country]}`;
};
