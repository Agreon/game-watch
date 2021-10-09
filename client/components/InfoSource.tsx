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
import { useCallback, useState } from "react";
import { Game, InfoSource as Source, useGameContext } from "../providers/GameProvider"
import { ChevronDownIcon, ViewOffIcon } from '@chakra-ui/icons'


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
    <a href={url} target="_blank" rel="noreferrer">
        <b>{name}</b>
    </a>
)

const SteamInfoSource: React.FC<{ source: Source, game: Game }> = ({ source, game }) => {
    return (
        <Flex key={source.id} py="1rem" alignItems="center" justifyContent="space-between">
            <SourceName name="Steam" url={source.data.storeUrl} />
            <Box>
                <Stat>
                    <StatLabel>Release Date</StatLabel>
                    <StatNumber fontSize="1rem">{source.data.releaseDate.date}</StatNumber>
                </Stat>
            </Box>
            <Box>
                <Stat>
                    <StatLabel>Price</StatLabel>
                    <StatNumber fontSize="1rem">{source.data.priceInformation?.final ?? ""}</StatNumber>
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
        <Flex key={source.id} py="1rem" alignItems="center" justifyContent="space-between">
            <SourceName name="Nintendo" url={source.data.storeUrl} />
            <Box>
                <Stat>
                    <StatLabel>Release Date</StatLabel>
                    <StatNumber fontSize="1rem">{source.data.releaseDate}</StatNumber>
                </Stat>
            </Box>
            <Box>
                <Stat>
                    <StatLabel>Price</StatLabel>
                    <StatNumber fontSize="1rem">{source.data.priceInformation?.final ?? ""}</StatNumber>
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
            return (
                <Flex key={source.id} py="1rem" alignItems="center" justifyContent="space-between">
                    <SourceName name={source.type} url={source.data.storeUrl} />
                    <Box>
                        <Stat>
                            <StatLabel>Release Date</StatLabel>
                            <StatNumber fontSize="1rem">{source.data.releaseDate}</StatNumber>
                        </Stat>
                    </Box>
                    <Box>
                        <Stat>
                            <StatLabel>Price</StatLabel>
                            <StatNumber fontSize="1rem">{source.data.priceInformation?.final ?? ""}</StatNumber>
                        </Stat>
                    </Box>
                    <Box>
                        <Options game={game} source={source} />
                    </Box>
                </Flex>
            )
    }
}