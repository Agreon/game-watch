import {
    Box,
    Stat,
    StatLabel,
    StatNumber,
    Text,
} from "@chakra-ui/react";
import { StoreGameData } from "@game-watch/shared";
import dayjs from "dayjs";
import React, { useCallback, useMemo } from "react";

import { InfoSourceWrapper } from "./InfoSourceWrapper";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const ReleaseDate: React.FC<{ date?: Date }> = ({ date }) => {
    const formattedDate = useMemo(() => date ? dayjs(date).format("DD MMM, YYYY") : "TBD", [date]);

    return (
        <Stat>
            <StatLabel>Release Date</StatLabel>
            <StatNumber fontSize="1rem">{formattedDate}</StatNumber>
        </Stat>
    );
};

const Price: React.FC<{ price?: number, initial?: number }> = ({ price, initial }) => {
    const formatPrice = useCallback((price?: number) => {
        if (price === undefined) {
            return "TBA";
        }

        if (price === 0) {
            return "Free";
        }

        return `${price}€`;
    }, []);

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
    return (
        <InfoSourceWrapper>
            <Box flex="1">
                <ReleaseDate date={data?.releaseDate} />
            </Box>
            <Box flex="1">
                <Price price={data?.priceInformation?.final} initial={data?.priceInformation?.initial} />
            </Box>
        </InfoSourceWrapper>
    );
};
