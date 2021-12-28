import { Box } from "@chakra-ui/layout"
import {
    Stat,
    StatLabel,
    StatNumber,
    Text,
} from "@chakra-ui/react";
import React, { useCallback, useMemo } from "react";
import dayjs from "dayjs";
import { InfoSourceWrapper, PreviewInfoSourceWrapper } from "./InfoSourceWrapper";
import { InfoSourceDto, StoreInfoSource as StoreInfoSourceT, StoreGameData } from "@game-watch/shared";

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

const ReleaseDate: React.FC<{ date: string, expectedFormats: string[] }> = ({ date, expectedFormats }) => {
    const parsedDate = useMemo(() => {
        for (const format of expectedFormats) {
            const parsedDate = dayjs(date, format);
            if (parsedDate.isValid()) {
                return parsedDate.format("DD MMM, YYYY")
            }
        }

        return date;
    }, [date, expectedFormats]);

    return (
        <Stat>
            <StatLabel>Release Date</StatLabel>
            <StatNumber fontSize="1rem">{parsedDate}</StatNumber>
        </Stat>
    )
}

const Price: React.FC<{ price?: string, initial?: string }> = ({ price, initial }) => {
    const parsePrice = useCallback((price?: string) => {
        if (!price) {
            return "TBA";
        }

        if (price[0] === '€') {
            return price.slice(1) + "€"
        }
        return price;
    }, []);

    const hasDiscount = useMemo(() => price && initial && price !== initial, [price, initial]);
    const parsedPrice = useMemo(() => parsePrice(price), [parsePrice, price]);
    const parsedInitial = useMemo(() => parsePrice(initial), [parsePrice, initial]);

    return (
        <Stat>
            <StatLabel>Price</StatLabel>
            <StatNumber fontSize="1rem">{hasDiscount ? <Text as="s">{parsedInitial}</Text> : null} {parsedPrice}</StatNumber>
        </Stat>
    )
}

export const StoreInfoSource: React.FC<{
    expectedDateFormats: string[],
    data: StoreGameData | null,
}> = ({ expectedDateFormats, data }) => {
    return (
        <InfoSourceWrapper>
            <Box flex="1">
                <ReleaseDate date={data?.releaseDate || "TBD"} expectedFormats={expectedDateFormats} />
            </Box>
            <Box flex="1">
                <Price price={data?.priceInformation?.final} initial={data?.priceInformation?.initial} />
            </Box>
        </InfoSourceWrapper>
    )
}
