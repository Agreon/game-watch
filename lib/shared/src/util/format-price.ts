import { Country } from '../types/country';

const countryUnitMap: Record<Country, string> = {
    "US": "$",
    "EN-CA": "$",
    "ES-AR": "$",
    "ES-CL": "$",
    "ES-CO": "$",
    "ES-MX": "$",
    "ES-PE": "$",
    "FR-CA": "$",
    "PT-BR": "$",
    "AT": "$",
    "BE-FR": "$",
    "BE-NL": "$",
    "BG": "$",
    "CH-DE": "$",
    "CH-FR": "$",
    "CH-IT": "$",
    "CZ": "$",
    "DE": "€",
    "DK": "$",
    "ES": "$",
    "FI": "$",
    "FR": "$",
    "GB": "Pound",
    "GR": "€",
    "HR": "$",
    "HU": "$",
    "IE": "$",
    "IT": "$",
    "NL": "$",
    "NO": "$",
    "PL": "$",
    "PT": "$",
    "RO": "$",
    "RU": "$",
    "SE": "$",
    "SK": "$",
    "SL": "$",
    "SR": "$",
    "ZA": "$",
    "JP": "$",
    'AU': "$",
    'NZ': "$",
    'PH': "$",
    'MY': "$",
    'SG': "$",
};

export const formatPrice = ({ price, country }: { price?: number, country: Country }) => {
    if (price === undefined) {
        return 'TBA';
    }

    if (price === 0) {
        return 'Free';
    }

    if (countryUnitMap[country] === '$') {
        return `$${price}`;
    }

    return `${price}${countryUnitMap[country]}`;
};
