import { Box, Flex } from "@chakra-ui/layout";
import React, { useState } from "react";
import { Text, SkeletonText, useColorModeValue } from "@chakra-ui/react";
import { GameTileMenu } from "./GameTileMenu";
import { InfoSourceList } from "../InfoSource/InfoSourceList";
import { GameName } from "./GameName";
import { GameTags } from "../GameTags/GameTags";
import { useGameContext } from "../../providers/GameProvider";
import { GameThumbnail } from './GameThumbnail';

const GameTileComponent: React.FC = () => {
    const {
        loading,
        allInfoSources,
        activeInfoSources,
        setGameInfoSource,
        fullName,
        syncGame,
        deleteGame,
    } = useGameContext();

    const [highlightMenu, setHighlightMenu] = useState(false);

    return (
        <Box
            position="relative"
            marginX={[0, 0, "1rem"]}
            marginY="1rem"
            height="100%"
            minWidth={["100%", "28rem"]}
            maxWidth={["100vw", "28rem"]}
            overflow="hidden"
            bg={useColorModeValue('white', 'gray.800')}
            borderWidth="1px"
            rounded="lg"
            shadow="lg"
            boxShadow="xl"
            _hover={{
                borderColor: useColorModeValue("grey", "white")
            }}
            transition="border-color 0.15s ease"
            onMouseOver={() => setHighlightMenu(true)}
            onMouseLeave={() => setHighlightMenu(false)}
        >
            {!loading &&
                <Box position="absolute" right="0" top="0" zIndex="1">
                <GameTileMenu onSync={syncGame} onDelete={deleteGame} gameName={fullName} highlight={highlightMenu} />
                </Box>
            }
            <Flex direction="column">
                <GameThumbnail />
                <Box padding={[0, 0, "1rem"]}>
                    <GameName disableEdit={loading} />
                    <GameTags />
                    {allInfoSources.length === 0 && !loading && <Text size="xl" textAlign="center" my="1rem" >No sources found :C</Text>}
                    {loading && <SkeletonText mt="1rem" />}
                    {!loading && <InfoSourceList activeInfoSources={activeInfoSources} setGameInfoSource={setGameInfoSource} />}
                </Box>
            </Flex>
        </Box>
    )
}

export const GameTile = React.memo(GameTileComponent);