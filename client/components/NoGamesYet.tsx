import { Box } from "@chakra-ui/layout";
import { Text } from "@chakra-ui/react";
import React from 'react';

import { useGamesContext } from '../providers/GamesProvider';

export const NoGamesYet = () => {
    const { games, gamesLoading } = useGamesContext();

    if (gamesLoading || games.length) {
        return null;
    }

    return (
        <Box textAlign="center" mb="2rem">
            <Text fontSize="2xl">
                To get started, add a new game to watch:
            </Text>
        </Box>
    );
};
