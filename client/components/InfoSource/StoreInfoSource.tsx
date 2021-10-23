import { Flex, Box } from "@chakra-ui/layout"
import {
    Stat,
    StatLabel,
    StatNumber,
    Text,
} from "@chakra-ui/react";
import React, { useCallback, useMemo } from "react";
import dayjs from "dayjs";
import Image from 'next/image';
import { InfoSourceWrapper } from "./InfoSourceWrapper";
import { useInfoSourceContext } from "../../providers/InfoSourceProvider";
import steamLogo from '../../assets/steam.svg';
import switchLogo from '../../assets/switch.png';
import psLogo from '../../assets/playstation.svg';
import epicLogo from "../../assets/epic";

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

// TODO: Extract a layer above
export const SourceName: React.FC<{ type: string }> = ({ type }) => {
    if (type === "switch") {
        return (
            <Flex align="center">
                <Image alt="source-icon" src={switchLogo} height="30px" width="30px" />
                <Text fontWeight="bold" ml="0.5rem">Switch</Text>
            </Flex>
        )
    }

    if (type === "steam") {
        return (
            <Flex align="end">
                <Image alt="source-icon" src={steamLogo} height="30px" width="30px" />
                <Text fontWeight="bold" ml="0.5rem">Steam</Text>
            </Flex>
        )
    }

    if (type === "psStore") {
        return (
            <Flex align="end">
                <Image alt="source-icon" src={psLogo} height="30px" width="30px" />
                <Text fontWeight="bold" ml="0.5rem">PS Store</Text>
            </Flex>
        )
    }

    if (type === "epic") {
        return (
            <Flex align="ce">
                <Image alt="source-icon" src={epicLogo} height="30px" width="30px" />
                <Text fontWeight="bold" ml="0.5rem">Epic</Text>
            </Flex>
        )
    }

    return (<b>{type}</b>)
}

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
export const StoreInfoSource: React.FC<{ expectedDateFormats: string[] }> = ({ expectedDateFormats }) => {
    const { source } = useInfoSourceContext();
    return (
        <InfoSourceWrapper
            name={<SourceName type={source.type} />}
        >
            <Box flex="1">
                <ReleaseDate date={source.data!.releaseDate} expectedFormats={expectedDateFormats} />
            </Box>
            <Box flex="1">
                <Price price={source.data!.priceInformation?.final} initial={source.data!.priceInformation?.initial} />
            </Box>
        </InfoSourceWrapper>
    )
}
