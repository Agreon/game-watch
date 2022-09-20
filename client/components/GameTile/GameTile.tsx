import { Box, Flex, SkeletonText, Text, useColorModeValue } from '@chakra-ui/react';
import React, { useState } from 'react';

import { useGameContext } from '../../providers/GameProvider';
import { InfoSourceProvider } from '../../providers/InfoSourceProvider';
import { GameTags } from '../GameTags/GameTags';
import { InfoSource } from '../InfoSource/InfoSource';
import { AddInfoSource } from './AddInfoSource';
import { GameName } from './GameName';
import { GameThumbnail } from './GameThumbnail';
import { GameTileMenu } from './GameTileMenu';

const GameTileComponent: React.FC = () => {
    const {
        loading,
        activeInfoSources,
        setGameInfoSource,
        removeGameInfoSource,
        syncGame,
        deleteGame,
        game
    } = useGameContext();

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
                                    No sources found :C
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
                    {!game.syncing && <AddInfoSource />}
                </Box>
            </Flex>
        </Box>
    );
};

export const GameTile = React.memo(GameTileComponent);
