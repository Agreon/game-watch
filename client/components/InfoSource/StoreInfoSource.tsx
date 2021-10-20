import { Flex, Box } from "@chakra-ui/layout"
import {
    Stat,
    StatLabel,
    StatNumber,
    Text,
    Tooltip
} from "@chakra-ui/react";
import React, { useCallback, useMemo } from "react";
import dayjs from "dayjs";
import { LoadingSpinner } from "../LoadingSpinner";
import { InfoSourceOptions } from "./InfoSourceOptions";
import { InfoSource } from "../../providers/GamesProvider";
import Image from 'next/image';

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

/**
 * TODO:
 * - Icon for ps store
 */
export const SourceName: React.FC<{ name: string, url?: string }> = ({ name, url }) => {
    if (name === "switch") {
        return (
            <a href={url} target="_blank" rel="noreferrer">
                <Flex align="center">
                    <Image alt="source-icon" src="https://assets.nintendo.com/image/upload/f_auto,q_auto/Dev/aem-component-demo/switch-logo-large" height="30px" width="30px" />
                    <Text fontWeight="bold" ml="0.5rem">Switch</Text>
                </Flex>
            </a>
        )
    }

    if (name === "steam") {
        return (
            <a href={url} target="_blank" rel="noreferrer">
                <Flex align="end">
                    <Image alt="source-icon" src="https://cdn.akamai.steamstatic.com/store/about/icon-steamos.svg" height="30px" width="30px" />
                    <Text fontWeight="bold" ml="0.5rem">Steam</Text>
                </Flex>
            </a>
        )
    }

    if (name === "psStore") {
        return (
            <a href={url} target="_blank" rel="noreferrer">
                <Flex align="end">
                    <Image alt="source-icon" src="https://gmedia.playstation.com/is/image/SIEPDC/ps-store-blue-bag-icon-01-22sep20" height="30px" width="30px" />
                    <Text fontWeight="bold" ml="0.5rem">PS Store</Text>
                </Flex>
            </a>
        )
    }

    return (
        <a href={url} target="_blank" rel="noreferrer">
            <b>{name}</b>
        </a>
    )
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
        <Flex key={source.id} py="1rem" minHeight="4.8rem" align="center" justify="space-between">
            <Tooltip label={source.data?.fullName} placement="top">
                <Box flex="1">
                    <SourceName name={source.type} url={source.data?.storeUrl} />
                </Box>
            </Tooltip>
            {source.loading ? (
                <Box flex="2" position="relative"><LoadingSpinner size="lg" /></Box>
            ) : (
                <>
                    {source.resolveError && <Text flex="1" fontSize="lg" color="tomato">Resolve error</Text>}
                    {!source.resolveError && source.data !== null &&
                        <>
                            <Box flex="1">
                                <ReleaseDate date={source.data.releaseDate} expectedFormats={expectedDateFormats} />
                            </Box>
                            <Box flex="1">
                                <Price price={source.data.priceInformation?.final} initial={source.data.priceInformation?.initial} />
                            </Box>
                        </>
                    }
                </>
            )}
            <Box><InfoSourceOptions source={source} /></Box>
        </Flex>
    )
}
