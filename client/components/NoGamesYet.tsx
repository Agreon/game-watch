import { Box, Text } from "@chakra-ui/react";
import React from 'react';

import { useGamesContext } from '../providers/GamesProvider';

export const NoGamesYet = () => {
    const { games, gamesLoading, filter } = useGamesContext();

    if (gamesLoading || games.length || filter.infoSources.length || filter.tags.length) {
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
