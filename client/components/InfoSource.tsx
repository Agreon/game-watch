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
import { useCallback, useMemo, useState } from "react";
import { Game, InfoSource as Source, useGameContext } from "../providers/GameProvider"
import { ChevronDownIcon, DownloadIcon, ViewOffIcon } from '@chakra-ui/icons'
import dayjs from "dayjs";
import { LoadingSpinner } from "./LoadingSpinner";
var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

/**
TODO:
- edit
- pass loading state to parent
 */
const Options: React.FC<{ source: Source, game: Game }> = ({ source, game }) => {
    const { disableInfoSource, syncInfoSource } = useGameContext();

    const [loading, setLoading] = useState(false);

    const onDisable = useCallback(async () => {
        setLoading(true);
        try {
            await disableInfoSource(game, source);
        } finally {
            setLoading(false);
        }
    }, [disableInfoSource, game, source])


    const onSync = useCallback(async () => {
        setLoading(true);
        try {
            await syncInfoSource(game, source);
        } finally {
            setLoading(false);
        }
    }, [syncInfoSource, game, source])


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
                <MenuItem icon={<ViewOffIcon />} onClick={onDisable}>
                    Remove
                </MenuItem>
            </MenuList>
        </Menu>
    )
}

/**
 * TODO:
 * - Icon for source
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

// TODO: is minheight needed?
const StoreInfoSource: React.FC<{ source: Source, game: Game, expectedDateFormats: string[] }> = ({ source, game, expectedDateFormats }) => {
    return (
        <Tooltip label={source.data?.fullName} placement="top">
            <Flex key={source.id} py="1rem" minHeight="4.8rem" align="center" justify="space-between">
                <Box flex="0.7">
                    <SourceName name={source.type} url={source.data?.storeUrl} />
                </Box>
                {(source.data === null && !source.resolveError) && <Box flex="2" position="relative"><LoadingSpinner size="lg" /></Box>}
                {(source.data === null && source.resolveError) && <Text flex="1" fontSize="lg" color="tomato">Resolve error</Text>}
                {source.data !== null &&
                    <>
                        <Box flex="1">
                            <ReleaseDate date={source.data.releaseDate} expectedFormats={expectedDateFormats} />
                        </Box>
                        <Box flex="0.7">
                            <Price price={source.data.priceInformation?.final} />
                        </Box>
                    </>
                }
                <Box>
                    <Options game={game} source={source} />
                </Box>
            </Flex>
        </Tooltip>
    )
}


export const InfoSource: React.FC<{ source: Source, game: Game }> = ({ source, game }) => {
    switch (source.type) {
        case "steam":
            return <StoreInfoSource source={source} game={game} expectedDateFormats={["D MMM, YYYY", "D MMMM, YYYY"]} />
        case "nintendo":
            return <StoreInfoSource source={source} game={game} expectedDateFormats={["MMMM DD, YYYY"]} />
        case "psStore":
        default:
            return <StoreInfoSource source={source} game={game} expectedDateFormats={["M/D/YYYY"]} />
    }
}