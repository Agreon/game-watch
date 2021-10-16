import { Flex, Box } from "@chakra-ui/layout"
import {
    Stat,
    StatLabel,
    StatNumber,
    Text,
    Tooltip
} from "@chakra-ui/react";
import React from "react";
import dayjs from "dayjs";
import { LoadingSpinner } from "../LoadingSpinner";
import { InfoSourceOptions } from "./InfoSourceOptions";
import { InfoSource } from "../../providers/GameProvider";

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

/**
 * TODO:
 * - Icon for source
 * => Maybe use chakra tags etc.
 * https://store.akamai.steamstatic.com/public/shared/images/header/logo_steam.svg?t=962016
 */
const SourceName: React.FC<{ name: string, url?: string }> = ({ name, url }) => (
    <a href={url} target="_blank" rel="noreferrer">
        <b>{name}</b>
    </a>
)

const ReleaseDate: React.FC<{ date: string, expectedFormats: string[] }> = ({ date, expectedFormats }) => {
    // TODO: Not decidable until the user can select a language
    // const parsedDate = useMemo(() => {
    //     for (const format of expectedFormats) {
    //         const parsedDate = dayjs(date, format);
    //         if (parsedDate.isValid()) {
    //             return parsedDate.format("DD MMM, YYYY")
    //         }
    //     }

    //     return date;
    // }, [date, expectedFormats]);

    return (
        <Stat>
            <StatLabel>Release Date</StatLabel>
            <StatNumber fontSize="1rem">{date}</StatNumber>
        </Stat>
    )
}

const Price: React.FC<{ price?: number, initial?: number }> = ({ price, initial }) => (
    <Stat>
        <StatLabel>Price</StatLabel>
        <StatNumber fontSize="1rem">{initial !== price ? <Text as="s">{initial}</Text> : null} {price ?? "TBA"}</StatNumber>
    </Stat>
)

export const StoreInfoSource: React.FC<{ source: InfoSource, expectedDateFormats: string[] }> = ({ source, expectedDateFormats }) => {
    return (
        <Flex key={source.id} py="1rem" minHeight="4.8rem" align="center" justify="space-between">
            <Tooltip label={source.data?.fullName} placement="top">
                <Box flex="0.7">
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
