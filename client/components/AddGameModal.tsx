import {
    Box,
    Button,
    Checkbox,
    Fade,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    useBreakpointValue
} from '@chakra-ui/react';
import React, { useState } from 'react';

import { useGameContext } from '../providers/GameProvider';
import { InfoSourceProvider } from '../providers/InfoSourceProvider';
import { useUserContext } from '../providers/UserProvider';
import { ModalProps } from '../util/types';
import { useAction } from '../util/useAction';
import { AddInfoSource } from './InfoSource/AddInfoSource';
import { InfoSourcePreview } from './InfoSource/InfoSourcePreview';
import { LoadingSpinner } from './LoadingSpinner';

export const AddGameModal: React.FC<ModalProps> = ({ show, onClose }) => {
    const { game, } = useGameContext();

    return (
        <Modal
            onClose={onClose}
            isOpen={show}
            motionPreset='none'
            size={useBreakpointValue(['full', 'full', '2xl'])}
            scrollBehavior={useBreakpointValue(['inside', 'inside', 'outside'])}
        >
            <ModalOverlay />
            <ModalContent maxWidth="48rem">
                <ModalHeader>
                    Add Game
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody >
                    <Flex
                        direction="column"
                        justify="space-between"
                        align="center"
                        width="100%"
                        height="100%"
                        pl={['0', '0', '2rem']}
                        pr={['0', '0', '2rem']}
                        pb="2rem"
                    >
                        {
                            game.syncing
                                ? <AddGameLoadingScreen onClose={onClose} />
                                : <SetupGameForm onClose={onClose} />
                        }
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

const AddGameLoadingScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const {
        activeInfoSources,
        setGameInfoSource,
        removeGameInfoSource,
    } = useGameContext();

    return (
        <>
            <Flex my="1rem">
                <Text fontSize="2xl">
                    We are searching for the game. Just a moment...
                </Text>
            </Flex>
            <Flex direction="column" my="1rem" width="100%">
                {activeInfoSources.map(source =>
                    <InfoSourceProvider
                        key={source.id}
                        source={source}
                        setGameInfoSource={setGameInfoSource}
                        removeGameInfoSource={removeGameInfoSource}
                    >
                        <Fade in={true}>
                            <Box mb="1rem">
                                <InfoSourcePreview />
                            </Box>
                        </Fade>
                    </InfoSourceProvider>
                )}
                <Box position="relative" my="2rem">
                    <LoadingSpinner size="xl" />
                </Box>
            </Flex>
            <Flex justify="flex-end" width="100%">
                <Button size="lg" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    ml="1rem"
                    size="lg"
                    colorScheme="teal"
                    disabled={true}
                >
                    Save
                </Button>
            </Flex>
        </>
    );
};

const SetupGameForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { user: { interestedInSources } } = useUserContext();
    const {
        game,
        setupGame,
        activeInfoSources,
        setGameInfoSource,
        removeGameInfoSource,
    } = useGameContext();

    const availableInfoSources = interestedInSources.filter(
        type => activeInfoSources.find(source => source.type === type) === undefined
    );

    const { loading, execute: onAdd } = useAction(setupGame, { onSuccess: onClose });

    const activeSourceName = activeInfoSources[0]?.data.fullName;
    const [name, setName] = useState(activeSourceName || game.search);
    const [continueSearching, setContinueSearching] = useState(true);

    return (
        <>
            <Flex my="1rem">
                {
                    activeInfoSources.length > 0
                        ? <Text fontSize="2xl">Here is what we found: </Text>
                        : <Flex direction="column" align="center">
                            <Text fontSize="2xl">
                                {`We couldn't find any sources for '${game.search}'`}
                            </Text>
                            <Text fontSize="xl" mt="2rem">
                                {`You can still save the game and we'll add the entries as soon as the game is added to a source you are interested in.`}
                            </Text>
                        </Flex>
                }
            </Flex>
            <Flex direction="column" mt="1rem" width="100%">
                {activeInfoSources.map(source =>
                    <InfoSourceProvider
                        key={source.id}
                        source={source}
                        setGameInfoSource={setGameInfoSource}
                        removeGameInfoSource={removeGameInfoSource}
                    >
                        <Box mb="1rem">
                            <InfoSourcePreview />
                        </Box>
                    </InfoSourceProvider>
                )}
                <Box position="relative" my="2rem">
                    {availableInfoSources.length > 0 &&
                        <Flex direction="column" mb="2rem">
                            <Box mb="1rem">
                                <Text fontSize="lg" fontWeight="bold">Add sources manually</Text>
                            </Box>

                            <AddInfoSource scheme='secondary' />
                        </Flex>
                    }

                    <Text fontSize="lg" mb="0.5rem" fontWeight="bold">
                        Options
                    </Text>
                    <FormControl variant="alwaysFloating" mt="1rem">
                        <FormLabel>Displayed Name</FormLabel>
                        <Input
                            value={name}
                            onChange={event => setName(event.target.value)}
                        />
                    </FormControl>
                    {
                        activeInfoSources.length > 0 && (
                            <Checkbox
                                mt="1rem"
                                isChecked={continueSearching}
                                onChange={event => setContinueSearching(event.target.checked)}
                            >
                                <Text fontSize="lg" mt="0.25rem">
                                    Continue searching for the game in the other sources you are interested in
                                </Text>
                            </Checkbox>
                        )
                    }
                </Box>
            </Flex>
            <Flex justify="flex-end" width="100%">
                <Button size="lg" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    ml="1rem"
                    size="lg"
                    colorScheme="teal"
                    isLoading={loading}
                    disabled={loading || game.syncing}
                    onClick={() => onAdd({ name, continueSearching })}
                >
                    Save
                </Button>
            </Flex>
        </>
    );
};
