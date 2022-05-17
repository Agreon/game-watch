import {
    Box,
    Stat,
    StatLabel,
    StatNumber,
    Text,
} from "@chakra-ui/react";
import { Country, StoreGameData } from "@game-watch/shared";
import React, { useCallback, useMemo } from "react";

import { useUserContext } from "../../providers/UserProvider";
import { formatReleaseDate } from "../../util/format-release-date";
import { InfoSourceWrapper } from "./InfoSourceWrapper";

const ReleaseDate: React.FC<{ date?: Date; originalDate?: string }> = ({ date, originalDate }) => {
    const formattedDate = useMemo(() => formatReleaseDate({ date, originalDate }), [date, originalDate]);

    return (
        <Stat>
            <StatLabel>Release Date</StatLabel>
            <StatNumber fontSize="1rem">{formattedDate}</StatNumber>
        </Stat>
    );
};


const countryUnitMap: Record<Country, string> = {
    "DE": "€",
    "US": "$"
};

const Price: React.FC<{ price?: number, initial?: number, userCountry: Country }> = ({ price, initial, userCountry }) => {
    const formatPrice = useCallback((price?: number) => {
        if (price === undefined) {
            return "TBA";
        }

        if (price === 0) {
            return "Free";
        }

        if (countryUnitMap[userCountry] === "$") {
            return `$${price}`;
        }

        return `${price}${countryUnitMap[userCountry]}`;
    }, [userCountry]);

    const hasDiscount = useMemo(() => price && initial && price !== initial, [price, initial]);
    const parsedPrice = useMemo(() => formatPrice(price), [formatPrice, price]);
    const parsedInitial = useMemo(() => formatPrice(initial), [formatPrice, initial]);

    return (
        <Stat>
            <StatLabel>Price</StatLabel>
            <StatNumber fontSize="1rem">{hasDiscount ? <Text as="s">{parsedInitial}</Text> : null} {parsedPrice}</StatNumber>
        </Stat>
    );
};

export const StoreInfoSource: React.FC<{ data: StoreGameData | null, }> = ({ data }) => {
    const { user } = useUserContext();

    return (
        <InfoSourceWrapper>
            <Box flex="1">
                <ReleaseDate date={data?.releaseDate} originalDate={data?.originalReleaseDate} />
            </Box>
            <Box flex="1">
                <Price
                    price={data?.priceInformation?.final}
                    initial={data?.priceInformation?.initial}
                    userCountry={user.country}
                />
            </Box>
        </InfoSourceWrapper>
    );
};
