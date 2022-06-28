import { Country } from "../types/country";

const countryUnitMap: Record<Country, string> = {
    "DE": "€",
    "US": "$"
};

export const formatPrice = ({ price, country }: { price?: number, country: Country }) => {
    if (price === undefined) {
        return "TBA";
    }

    if (price === 0) {
        return "Free";
    }

    if (countryUnitMap[country] === "$") {
        return `$${price}`;
    }

    return `${price}${countryUnitMap[country]}`;
};
