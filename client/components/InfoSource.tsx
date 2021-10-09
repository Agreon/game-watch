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
} from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { Game, InfoSource as Source, useGameContext } from "../providers/GameProvider"
import { ChevronDownIcon, ViewOffIcon } from '@chakra-ui/icons'
import dayjs from "dayjs";
var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

/**
TODO:
- sync
- edit
 */
const Options: React.FC<{ source: Source, game: Game }> = ({ source, game }) => {
    const { disableInfoSource } = useGameContext();

    const [loading, setLoading] = useState(false);

    const onDisable = useCallback(async () => {
        setLoading(true);
        try {
            await disableInfoSource(game, source);
        } finally {
            setLoading(false);
        }
    }, [disableInfoSource, game, source])

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
                <MenuItem icon={<ViewOffIcon />} onClick={onDisable}>
                    Disable
                </MenuItem>
            </MenuList>
        </Menu>
    )
}

const SourceName: React.FC<{ name: string, url: string }> = ({ name, url }) => (
    <Box flex="0.7">
        <a href={url} target="_blank" rel="noreferrer">
            <b>{name}</b>
        </a>
    </Box>
)

const ReleaseDate: React.FC<{ date: string, expectedFormat?: string }> = ({ date, expectedFormat }) => {
    const parsedDate = useMemo(() => {
        if (parseInt(date) !== NaN && !date.includes("/")) {
            return date;
        }

        return dayjs(date, expectedFormat).format("DD MMM YYYY");
    }, [date, expectedFormat]);

    return (
        <Flex flex="1">
            <Stat>
                <StatLabel>Release Date</StatLabel>
                <StatNumber fontSize="1rem">{parsedDate}</StatNumber>
            </Stat>
        </Flex>
    )
}


const SteamInfoSource: React.FC<{ source: Source, game: Game }> = ({ source, game }) => {
    return (
        <Flex key={source.id} py="1rem" align="center" justify="space-between">
            <SourceName name="Steam" url={source.data.storeUrl} />
            <ReleaseDate date={source.data.releaseDate.date} />
            <Box flex="0.7">
                <Stat>
                    <StatLabel>Price</StatLabel>
                    <StatNumber fontSize="1rem">{source.data.priceInformation?.final ?? "TBA"}</StatNumber>
                </Stat>
            </Box>
            <Box>
                <Options game={game} source={source} />
            </Box>
        </Flex>
    )
}

const NintendoInfoSource: React.FC<{ source: Source, game: Game }> = ({ source, game }) => {
    return (
        <Flex key={source.id} py="1rem" align="center" justify="space-between">
            <SourceName name="Nintendo" url={source.data.storeUrl} />
            <ReleaseDate date={source.data.releaseDate} />
            <Box flex="0.7">
                <Stat>
                    <StatLabel>Price</StatLabel>
                    <StatNumber fontSize="1rem">{source.data.priceInformation?.final ?? "TBA"}</StatNumber>
                </Stat>
            </Box>
            <Box>
                <Options game={game} source={source} />
            </Box>
        </Flex>
    )
}

/**
 * TODO:
 * - Icon for source
 * - Price
 * - Options
 *
 * => Grid for alignment
 */
export const InfoSource: React.FC<{ source: Source, game: Game }> = ({ source, game }) => {
    switch (source.type) {
        case "steam":
            return <SteamInfoSource source={source} game={game} />
        case "nintendo":
            return <NintendoInfoSource source={source} game={game} />
        case "psStore":
        default:
            console.log(source)

            return (
                <Flex py="1rem" align="center" justify="space-between">
                    <SourceName name={source.type} url={source.data.storeUrl} />
                    <ReleaseDate date={source.data.releaseDate} expectedFormat={"M/D/YYYY"} />
                    <Box flex="0.7">
                        <Stat>
                            <StatLabel>Price</StatLabel>
                            <StatNumber fontSize="1rem">{source.data.priceInformation?.final ?? "TBA"}</StatNumber>
                        </Stat>
                    </Box>
                    <Box>
                        <Options game={game} source={source} />
                    </Box>
                </Flex>
            )
    }
}