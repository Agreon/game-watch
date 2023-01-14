import {
    Box,
    Button,
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    SkeletonText,
    Text,
    useColorModeValue,
    useDisclosure,
} from '@chakra-ui/react';
import React, { useState } from 'react';

import { useGameContext } from '../../providers/GameProvider';
import { InfoSourceProvider } from '../../providers/InfoSourceProvider';
import { useUserContext } from '../../providers/UserProvider';
import { GameTags } from '../GameTags/GameTags';
import { AddInfoSource } from '../InfoSource/AddInfoSource';
import { InfoSource } from '../InfoSource/InfoSource';
import { GameName } from './GameName';
import { GameThumbnail } from './GameThumbnail';
import { GameTileMenu } from './GameTileMenu';

const GameTileComponent: React.FC = () => {
    const { user: { interestedInSources } } = useUserContext();
    const {
        loading,
        activeInfoSources,
        setGameInfoSource,
        removeGameInfoSource,
        syncGame,
        deleteGame,
        game
    } = useGameContext();

    const availableInfoSources = interestedInSources.filter(
        type => activeInfoSources.find(source => source.type === type) === undefined
    );

    const {
        isOpen: showAddInfoSourceModal,
        onOpen: openAddInfoSourceModal,
        onClose: closeAddInfoSourceModal,
    } = useDisclosure();

    const [highlightMenu, setHighlightMenu] = useState(false);

    return (
        <Box
            id={game.id}
            position="relative"
            marginY="1rem"
            minWidth={['100%', '28rem']}
            maxWidth={['100vw', '28rem']}
            overflow="hidden"
            bg={useColorModeValue('white', 'gray.800')}
            borderWidth="1px"
            rounded="lg"
            shadow="lg"
            boxShadow="xl"
            _hover={{
                borderColor: useColorModeValue('grey', 'white')
            }}
            transition="border-color 0.15s ease"
            onMouseOver={() => setHighlightMenu(true)}
            onMouseLeave={() => setHighlightMenu(false)}
        >
            {!loading &&
                <Box position="absolute" right="0" top="0" zIndex="3">
                    <GameTileMenu
                        onSync={syncGame}
                        onDelete={deleteGame}
                        gameName={game.name as string}
                        highlight={highlightMenu}
                    />
                </Box>
            }
            <Flex direction="column">
                <GameThumbnail />
                <Box paddingX={['0.3rem', '0.3rem', '1rem']} pt="0.5rem" pb="1rem">
                    <GameName disableEdit={loading || game.syncing} />
                    {activeInfoSources.length === 0 && (
                        game.syncing
                            ? <SkeletonText mt="1rem" />
                            : (
                                <Text size="xl" textAlign="center" my="1rem">
                                    No sources found yet :C
                                </Text>
                            )
                    )}
                    {activeInfoSources.length !== 0 && (
                        <>
                            <GameTags />
                            <Box>
                                {activeInfoSources.map(source =>
                                    <InfoSourceProvider
                                        key={source.id}
                                        source={source}
                                        setGameInfoSource={setGameInfoSource}
                                        removeGameInfoSource={removeGameInfoSource}
                                    >
                                        <InfoSource />
                                    </InfoSourceProvider>
                                )}
                            </Box>
                        </>
                    )}
                    {!game.syncing && availableInfoSources.length > 0 && (
                        <Flex justify="center">
                            <Button onClick={openAddInfoSourceModal}>
                                +
                            </Button>
                        </Flex>
                    )}
                    <Modal
                        size="2xl"
                        isOpen={showAddInfoSourceModal}
                        onClose={closeAddInfoSourceModal}
                    >
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>Add new InfoSource</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody pb="2rem">
                                <AddInfoSource
                                    scheme='primary'
                                    onSuccess={closeAddInfoSourceModal}
                                />
                            </ModalBody>
                        </ModalContent>
                    </Modal>
                </Box>
            </Flex>
        </Box>
    );
};

export const GameTile = React.memo(GameTileComponent);
