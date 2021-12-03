import { Input } from "@chakra-ui/input";
import { Button, Fade, Modal, ModalBody, ModalContent, ModalOverlay, useColorModeValue, useDisclosure } from "@chakra-ui/react";
import { Box, Flex, Text } from "@chakra-ui/layout";
import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { GameProvider, useGameContext } from "../providers/GameProvider";
import { InfoSourcePreview } from "./InfoSource/InfoSource";
import { InfoSourceProvider } from "../providers/InfoSourceProvider";
import { LoadingSpinner } from "./LoadingSpinner";
import { useGamesContext } from "../providers/GamesProvider";
import { AddInfoSource } from "./GameTile/AddInfoSource";
import { useAction } from "../util/useAction";

interface AddGameModalProps {
    show: boolean;
    onClose: () => void;
}

/**
 * - TODO: Let users edit the provided name beforehand?
 * - TODO: Let users re-search
 * - TODO: If list gets long, searchbox is moved?
 * - TODO: Show footer
 * - TODO: Proportions/Design is shit
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
            size="full"
        >
            <ModalOverlay />
            <ModalContent pt="6rem" pb="6rem">
                <ModalBody>
                    <Flex justify="center">
                        <Flex align="center" width={["100%", "100%", "80%", "60%", "50%", "35%"]}>
                            <Flex direction="column" width="100%" >
                                <Box position="relative" mx="6rem">
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
                                <Flex>
                                    {game.syncing
                                        ? <Text fontSize="3xl" mt="4rem">We are searching for the game. Just a moment...</Text>
                                        : <Text fontSize="3xl" mt="4rem">Here is what we found: </Text>
                                    }
                                </Flex>
                                <Flex direction="column" mt="2rem" my="1rem">
                                    {activeInfoSources.map(source =>
                                        <InfoSourceProvider key={source.id} source={source} setGameInfoSource={setGameInfoSource}>
                                            <Fade in={true}><InfoSourcePreview /></Fade>
                                        </InfoSourceProvider>
                                    )}
                                    {game.syncing
                                        ? <Box position="relative" my="2rem"><LoadingSpinner size="xl" /></Box>
                                        : <AddInfoSource />
                                    }
                                </Flex>
                                <Flex justify="flex-end">
                                    <Button
                                        colorScheme="teal"
                                        size="lg"
                                        onClick={onAdd}
                                        disabled={loading || game.syncing}
                                        loading={loading}
                                    >
                                        Add
                                    </Button>
                                </Flex>
                            </Flex>
                        </Flex>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

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
