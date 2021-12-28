import { Input } from "@chakra-ui/input";
import {
    Button,
    Fade,
    FormControl,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Select,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import { Box, Flex, Text } from "@chakra-ui/layout";
import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { GameProvider, useGameContext } from "../providers/GameProvider";
import { InfoSourcePreview } from "./InfoSource/InfoSource";
import { InfoSourceProvider } from "../providers/InfoSourceProvider";
import { LoadingSpinner } from "./LoadingSpinner";
import { useGamesContext } from "../providers/GamesProvider";
import { useAction } from "../util/useAction";
import { InfoSourceType } from "@game-watch/shared";

interface AddGameModalProps {
    show: boolean;
    onClose: () => void;
}

const PlaceholderMap: Record<InfoSourceType, string> = {
    [InfoSourceType.Steam]: "https://store.steampowered.com/app/...",
    [InfoSourceType.Switch]: "https://nintendo.de/Spiele/Nintendo-Switch-Download-Software/...",
    [InfoSourceType.Epic]: "https://www.epicgames.com/store/de-DE/p/...",
    [InfoSourceType.PsStore]: "https://store.playstation.com/de-de/product/...",
    [InfoSourceType.Metacritic]: "https://www.metacritic.com/game/pc/...",
}

/**
 * TODO: Reduce duplication
 * TODO: Placeholder depending on type
 */
const AddSource: React.FC = () => {
    const { allInfoSources, addInfoSource } = useGameContext();
    const [url, setUrl] = useState("");

    const availableInfoSources = useMemo(
        () => Object.values(InfoSourceType)
            .filter(type =>
                !allInfoSources
                    .filter(source => !source.disabled)
                    .map(source => source.type)
                    .includes(type)
            ),
        [allInfoSources]
    );

    const [type, setType] = useState(availableInfoSources[0]);

    const { loading, execute: onAdd } = useAction(addInfoSource, {
        onSuccess: () => {
            setUrl("");
        }
    })

    return (
        <Flex direction="column">
            <Box mb="1rem">
                <Text fontSize="xl">Add further information sources:</Text>
            </Box>
            <Flex>
                <FormControl flex="0.3" mr="1rem">
                    <Select onChange={event => setType(event.target.value as InfoSourceType)}>
                        {availableInfoSources.map(source => (
                            <option key={source} value={source}>{source}</option>
                        ))}
                    </Select>
                </FormControl>
                <FormControl flex="1" mr="1rem">
                    <Input
                        value={url}
                        disabled={loading}
                        placeholder={PlaceholderMap[type]}
                        onChange={event => setUrl(event.target.value)}
                    />
                </FormControl>
                <FormControl flex="0">
                    <Button
                        onClick={() => onAdd({ type, url })}
                        disabled={loading}
                        loading={loading}
                    >
                        Add
                    </Button>
                </FormControl>
            </Flex>
        </Flex>
    )
}

/**
 * - TODO: Let users edit the provided name beforehand?
 * - TODO: Option to disable search for more?
 * - TODO: Icon/Smiley for not found?
 */
const AddGameModal: React.FC<AddGameModalProps> = ({ show, onClose }) => {
    const { game, setGameInfoSource, setupGame } = useGameContext();
    const { loading, execute: onAdd } = useAction(setupGame, { onSuccess: onClose })

    // We need a loading state for the preview-cards for when one is added later.
    const activeInfoSources = game.infoSources.filter(
        source => !source.disabled && (game.syncing ? !source.syncing : true)
    );
    return (
        <Modal
            isCentered
            onClose={onClose}
            isOpen={show}
            motionPreset='none'
            size="2xl"
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    Add Game
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb="2rem">
                    <Flex justify="center">
                        <Flex direction="column" width="100%">
                            <Flex my="1rem">
                                {game.syncing
                                    ? <Text fontSize="2xl">We are searching for the game. Just a moment...</Text>
                                    : activeInfoSources.length > 0
                                        ? <Text fontSize="2xl">Here is what we found: </Text>
                                        : <Text fontSize="2xl">{`We couldn't find any sources for '${game.search}' :/`}</Text>
                                }
                            </Flex>
                            <Flex direction="column" my="1rem">
                                {activeInfoSources.map(source =>
                                    <InfoSourceProvider key={source.id} source={source} setGameInfoSource={setGameInfoSource}>
                                        <Fade in={true}><InfoSourcePreview /></Fade>
                                    </InfoSourceProvider>
                                )}
                                <Box position="relative" my="2rem">
                                    {game.syncing
                                        ? <LoadingSpinner size="xl" />
                                        : <AddSource />
                                    }
                                </Box>
                            </Flex>
                            {!game.syncing &&
                                <Flex justify="flex-end">
                                    <Button
                                        colorScheme="teal"
                                        size="lg"
                                        onClick={onAdd}
                                        disabled={loading || game.syncing}
                                        loading={loading}
                                    >
                                    Save
                                    </Button>
                                </Flex>
                            }
                        </Flex>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

/**
// width={["100%", "100%", "80%", "60%", "50%", "35%"]}
 *
 *   <Box position="relative" mx="6rem">
                                    <Input
                                        value={game.search}
                                        disabled={true}
                                        bg={useColorModeValue("white", "gray.800")}
                                        size="lg"
                                    />
                                    <Button
                                        right="-8rem"
                                        position="absolute"
                                        variant="solid"
                                        colorScheme="teal"
                                        size="lg"
                                        disabled={loading || game.syncing}
                                    >
                                        Search
                                    </Button>
                                </Box>
 */
export const AddGame: React.FC = () => {
    const { addGame, setGame, removeGame, games } = useGamesContext();
    const [name, setName] = useState("");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [gameId, setGameId] = useState<string | null>(null);
    const { loading, execute: searchGame } = useAction(addGame, {
        onSuccess: game => {
            setGameId(game.id);
            onOpen();
        }
    })

    // Focus initially
    const inputRef = useRef<HTMLInputElement | null>(null)
    useEffect(() => { inputRef.current && inputRef.current.focus() }, []);

    const onNameKeyPress = useCallback(async ({ key }) => {
        if (key === "Enter") {
            await searchGame(name);
        }
    }, [searchGame, name]);

    const onCloseModal = useCallback(() => {
        setGameId(null)
        setName("");
        onClose();
    }, [onClose])

    const currentGame = useMemo(() => games.find(game => game.id === gameId), [games, gameId]);

    return (
        <>
            <Flex align="center">
                <Input
                    ref={inputRef}
                    value={name}
                    disabled={loading}
                    onChange={(event) => setName(event.target.value)}
                    onKeyPress={onNameKeyPress}
                    placeholder="Name of the game"
                    bg={useColorModeValue("white", "gray.800")}
                    size="lg"
                />
                <Button
                    variant="solid"
                    colorScheme="teal"
                    ml="1rem"
                    size="lg"
                    onClick={() => searchGame(name)}
                    isLoading={loading}
                >
                    Search
                </Button>
            </Flex>
            {currentGame &&
                <GameProvider game={currentGame} setGame={setGame} removeGame={removeGame} >
                    <AddGameModal show={isOpen} onClose={onCloseModal} />
                </GameProvider>
            }
        </>
    )
}
