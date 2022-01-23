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
    useBreakpointValue,
} from "@chakra-ui/react";
import { Box, Flex, Text } from "@chakra-ui/layout";
import React, { useCallback, useState } from "react";
import { useGameContext } from "../providers/GameProvider";
import { InfoSourceProvider } from "../providers/InfoSourceProvider";
import { LoadingSpinner } from "./LoadingSpinner";
import { useAction } from "../util/useAction";
import { InfoSourceType } from "@game-watch/shared";
import { InfoSourcePreview } from "./InfoSource/InfoSourcePreview";

export const PlaceholderMap: Record<InfoSourceType, string> = {
    [InfoSourceType.Steam]: "https://store.steampowered.com/app/...",
    [InfoSourceType.Switch]: "https://nintendo.de/Spiele/Nintendo-Switch-Download-Software/...",
    [InfoSourceType.Epic]: "https://www.epicgames.com/store/de-DE/p/...",
    [InfoSourceType.PsStore]: "https://store.playstation.com/de-de/product/...",
    [InfoSourceType.Metacritic]: "https://www.metacritic.com/game/pc/...",
}

const AddSource: React.FC = () => {
    const { availableInfoSources, addInfoSource } = useGameContext();
    const [type, setType] = useState(availableInfoSources[0]);
    const [url, setUrl] = useState("");

    const { loading, execute: onAdd } = useAction(addInfoSource, {
        onSuccess: () => {
            setUrl("");
        }
    })

    if (!availableInfoSources.length) {
        return null;
    }

    return (
        <Flex direction="column">
            <Box mb="1rem">
                <Text fontSize="xl">Add further information sources:</Text>
            </Box>
            <Flex direction={["column", "row"]}>
                <FormControl flex="0.3" mr="1rem" mb={["0.5rem", 0]}>
                    <Select onChange={event => setType(event.target.value as InfoSourceType)}>
                        {availableInfoSources.map(source => (
                            <option key={source} value={source}>{source}</option>
                        ))}
                    </Select>
                </FormControl>
                <FormControl flex="1" mr="1rem" mb={["0.5rem", 0]}>
                    <Input
                        value={url}
                        disabled={loading}
                        placeholder={PlaceholderMap[type]}
                        onChange={event => setUrl(event.target.value)}
                    />
                </FormControl>
                <FormControl display="flex" flex="0" mb={["0.5rem", 0]} justifyContent={["end", "unset"]}>
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

interface AddGameModalProps {
    show: boolean;
    onClose: () => void;
}

/**
 * - TODO: Let users edit the provided name beforehand
 * - TODO: Option to disable search for more
 */
export const AddGameModal: React.FC<AddGameModalProps> = ({ show, onClose }) => {
    const { game, setGameInfoSource, setupGame } = useGameContext();
    const { loading, execute: onAdd } = useAction(setupGame, { onSuccess: onClose })

    // We use the direct infoSource so that they are sorted by date.
    const activeInfoSources = game.infoSources.filter(source => !source.disabled);

    const onAddGame = useCallback(async () => {
        if (!activeInfoSources.length) {
            return await onAdd({ name: game.search })
        }

        // We take the first name for now, later the user can decide.
        await onAdd({ name: activeInfoSources[0].remoteGameName });
    }, [onAdd, activeInfoSources, game]);

    return (
        <Modal
            isCentered
            onClose={onClose}
            isOpen={show}
            motionPreset='none'
            size="2xl"
            scrollBehavior={useBreakpointValue(["inside", "inside", "outside"])}
        >
            <ModalOverlay />
            <ModalContent
                maxWidth="48rem"
            >
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
                                    <InfoSourceProvider key={source.id} source={source} setGameInfoSource={setGameInfoSource} disablePolling={!!source.remoteGameName}>
                                        <Fade in={true}>
                                            <Box mb="1rem">
                                                <InfoSourcePreview />
                                            </Box>
                                        </Fade>
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
                                    onClick={onAddGame}
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
