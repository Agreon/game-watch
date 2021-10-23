import { Flex, Box } from "@chakra-ui/layout"
import {
    Stat,
    StatLabel,
    StatNumber,
    Text,
} from "@chakra-ui/react";
import React, { useCallback, useMemo } from "react";
import dayjs from "dayjs";
import { InfoSource } from "../../providers/GamesProvider";
import Image from 'next/image';
import { InfoSourceWrapper } from "./InfoSourceWrapper";
import steamLogo from '../../assets/steam.svg';
import switchLogo from '../../assets/switch.png';

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

/**
 * TODO:
 * - Icon for ps store
 */
export const SourceName: React.FC<{ name: string }> = ({ name }) => {
    if (name === "switch") {
        return (
            <Flex align="center">
                <Image alt="source-icon" src={switchLogo} height="30px" width="30px" />
                <Text fontWeight="bold" ml="0.5rem">Switch</Text>
            </Flex>
        )
    }

    if (name === "steam") {
        return (
            <Flex align="end">
                <Image alt="source-icon" src={steamLogo} height="30px" width="30px" />
                <Text fontWeight="bold" ml="0.5rem">Steam</Text>
            </Flex>
        )
    }

    if (name === "psStore") {
        return (
            <Flex align="end">
                <Image alt="source-icon" src="https://gmedia.playstation.com/is/image/SIEPDC/ps-store-blue-bag-icon-01-22sep20" height="30px" width="30px" />
                <Text fontWeight="bold" ml="0.5rem">PS Store</Text>
            </Flex>
        )
    }

    return (<b>{name}</b>)
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
export const StoreInfoSource: React.FC<{ source: InfoSource, expectedDateFormats: string[] }> = ({ source, expectedDateFormats }) => {
    return (
        <InfoSourceWrapper
            header={<SourceName name={source.type} />}
            source={source}
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
