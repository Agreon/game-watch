import React from 'react'
import { Text } from "@chakra-ui/react";
import { Box } from "@chakra-ui/layout";
import { useGameContext } from '../providers/GameProvider';

export const NoGamesYet = () => {
    const { games, gamesLoading } = useGameContext();

    if (gamesLoading || games.length) {
        return null;
    }

    return (
        <Box textAlign="center" mb="2rem">
            <Text fontSize="4xl">Welcome to GameWatch!</Text>

            <Text fontSize="2xl">
                To get started, add a new game to watch:
            </Text>
        </Box>
    )
}