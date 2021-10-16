import type { NextPage } from 'next'
import React from 'react'
import { Box, Flex } from "@chakra-ui/layout";

import { GameProvider } from '../providers/GameProvider';
import { GameGrid } from '../components/GameGrid';
import { AddGame } from '../components/AddGame';
import { NoGamesYet } from '../components/NoGamesYet';

const Home: NextPage = () => {
  return (
    <GameProvider>
      <Box>
        <NoGamesYet />
        <Flex justify="center">
          <Box width={["80%", "80%", "80%", "30%"]} ml={["0rem", "0rem", "0rem", "6rem"]}>
            <AddGame />
          </Box>
        </Flex>
        <GameGrid />
      </Box>
    </GameProvider>
  )
}

export default Home
