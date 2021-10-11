import { Flex, Box } from "@chakra-ui/layout"
import {
    IconButton,
    Menu,
    MenuList,
    MenuButton,
    MenuItem,
    Stat,
    StatLabel,
    StatNumber,
    Text,
    Tooltip
} from "@chakra-ui/react";
import { useCallback } from "react";
import { InfoSource as Source } from "../providers/GameProvider"
import { ChevronDownIcon, DownloadIcon, ViewOffIcon } from '@chakra-ui/icons'
import dayjs from "dayjs";
import { LoadingSpinner } from "./LoadingSpinner";
import { useInfoSourceContext } from "../providers/InfoSourceProvider";

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)


/**
TODO:
- edit
 */
const Options: React.FC<{ source: Source }> = ({ source }) => {
    const { disableInfoSource, syncInfoSource } = useInfoSourceContext();

    const onRemove = useCallback(() => disableInfoSource(source), [source, disableInfoSource]);
    const onSync = useCallback(() => syncInfoSource(source), [source, syncInfoSource]);

    return (
        <Menu>
            <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<ChevronDownIcon />}
                variant="outline"
                size="sm"
            />
            <MenuList>
                <MenuItem icon={<DownloadIcon />} onClick={onSync}>
                    Sync
                </MenuItem>
                <MenuItem icon={<ViewOffIcon />} onClick={onRemove}>
                    Remove
                </MenuItem>
            </MenuList>
        </Menu>
    )
}

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

const Price: React.FC<{ price?: number }> = ({ price }) => (
    <Stat>
        <StatLabel>Price</StatLabel>
        <StatNumber fontSize="1rem">{price ?? "TBA"}</StatNumber>
    </Stat>
)

const StoreInfoSource: React.FC<{ source: Source, expectedDateFormats: string[] }> = ({ source, expectedDateFormats }) => {
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
                            <Box flex="0.7">
                                <Price price={source.data.priceInformation?.final} />
                            </Box>
                        </>
                    }
                </>
            )}
            <Box><Options source={source} /></Box>
        </Flex>
    )
}

export const InfoSource: React.FC<{ source: Source }> = ({ source }) => {
    switch (source.type) {
        case "steam":
            return <StoreInfoSource source={source} expectedDateFormats={["D MMM, YYYY", "D MMMM, YYYY"]} />
        case "nintendo":
            return <StoreInfoSource source={source} expectedDateFormats={["MMMM DD, YYYY"]} />
        case "psStore":
        default:
            return <StoreInfoSource source={source} expectedDateFormats={["M/D/YYYY"]} />
    }
}