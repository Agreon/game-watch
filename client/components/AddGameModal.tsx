import {
    Box,
    Button,
    Fade,
    Flex,
    FormControl,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Select,
    Text,
    useBreakpointValue
} from '@chakra-ui/react';
import { InfoSourceType } from '@game-watch/shared';
import React, { useEffect, useState } from 'react';

import { useGameContext } from '../providers/GameProvider';
import { InfoSourceProvider } from '../providers/InfoSourceProvider';
import { useUserContext } from '../providers/UserProvider';
import { ModalProps } from '../util/types';
import { useAction } from '../util/useAction';
import { InfoSourcePreview } from './InfoSource/InfoSourcePreview';
import { LoadingSpinner } from './LoadingSpinner';

// TODO: Localize
export const PlaceholderMap: Record<InfoSourceType, string> = {
    [InfoSourceType.Steam]: 'https://store.steampowered.com/app/...',
    [InfoSourceType.Switch]: 'https://nintendo.de/Spiele/Nintendo-Switch-Download-Software/...',
    [InfoSourceType.Epic]: 'https://www.epicgames.com/store/de-DE/p/...',
    [InfoSourceType.PsStore]: 'https://store.playstation.com/de-de/product/...',
    [InfoSourceType.Metacritic]: 'https://www.metacritic.com/game/pc/...',
};

const AddSource: React.FC = () => {
    const { user: { interestedInSources } } = useUserContext();
    const { addInfoSource, activeInfoSources } = useGameContext();

    const availableInfoSources = interestedInSources.filter(
        type => activeInfoSources.find(source => source.type === type) === undefined
    );

    const [type, setType] = useState(availableInfoSources[0] ?? '');
    const [url, setUrl] = useState('');

    const { loading, execute: onAdd } = useAction(addInfoSource, {
        onSuccess: () => {
            setUrl('');
        }
    });

    if (!availableInfoSources.length) {
        return null;
    }

    return (
        <Flex direction="column">
            <Box mb="1rem">
                <Text fontSize="xl">Add further information sources:</Text>
            </Box>
            <Flex direction={['column', 'row']}>
                <FormControl flex="0.3" mr="1rem" mb={['0.5rem', 0]}>
                    <Select onChange={event => setType(event.target.value as InfoSourceType)}>
                        {availableInfoSources.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </Select>
                </FormControl>
                <FormControl flex="1" mr="1rem" mb={['0.5rem', 0]}>
                    <Input
                        value={url}
                        disabled={loading}
                        placeholder={PlaceholderMap[type]}
                        onChange={event => setUrl(event.target.value)}
                    />
                </FormControl>
                <FormControl
                    display="flex"
                    flex="0"
                    mb={['0.5rem', 0]}
                    justifyContent={['end', 'unset']}
                >
                    <Button
                        onClick={() => onAdd({ type, url })}
                        disabled={loading || !url.length}
                        isLoading={loading}
                    >
                        Add
                    </Button>
                </FormControl>
            </Flex>
        </Flex>
    );
};

const EditName: React.FC<{ onChange: (name: string) => void }> = ({ onChange }) => {
    const { activeInfoSources } = useGameContext();
    const [name, setName] = useState<string | null>(null);
    const activeSourceName = activeInfoSources[0]?.data.fullName;

    useEffect(() => onChange(name || activeSourceName), [onChange, name, activeSourceName]);

    return (
        <Flex direction={['column', 'row']} mt="3rem" align={['start', 'center']}>
            <Text fontSize="xl" mb={['0.5rem', 0]}>Suggested Name</Text>
            <FormControl flex="1" ml={[0, '1rem']}>
                <Input
                    value={name || activeSourceName}
                    onChange={event => setName(event.target.value)}
                />
            </FormControl>
        </Flex>
    );
};

export const AddGameModal: React.FC<ModalProps> = ({ show, onClose }) => {
    const {
        game,
        activeInfoSources,
        setGameInfoSource,
        removeGameInfoSource,
        setupGame,
    } = useGameContext();
    const { loading, execute: onAdd } = useAction(setupGame, { onSuccess: onClose });
    const [name, setName] = useState(game.search);

    // TODO: use ModalFooter
    return (
        <Modal
            isCentered
            onClose={onClose}
            isOpen={show}
            motionPreset='none'
            size={useBreakpointValue(['full', 'full', '2xl'])}
            scrollBehavior={useBreakpointValue(['inside', 'inside', 'outside'])}
        >
            <ModalOverlay />
            <ModalContent
                maxWidth="48rem"
            >
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
                        <Flex my="1rem">
                            {
                                game.syncing &&
                                <Text fontSize="2xl">
                                    We are searching for the game. Just a moment...
                                </Text>
                            }
                            {
                                !game.syncing && (
                                    activeInfoSources.length > 0
                                        ? <Text fontSize="2xl">Here is what we found: </Text>
                                        : <Text fontSize="2xl">
                                            {`We couldn't find any sources for '${game.search}' :/`}
                                        </Text>
                                )
                            }
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
                                {game.syncing
                                    ? <LoadingSpinner size="xl" />
                                    : <>
                                        <AddSource />
                                        <EditName onChange={setName} />
                                    </>
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
                                disabled={loading || game.syncing || !activeInfoSources.length}
                                onClick={() => onAdd({ name })}
                            >
                                Save
                            </Button>
                        </Flex>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
