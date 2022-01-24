import type { NextPage } from 'next'
import React from 'react'
import { Box, Flex } from "@chakra-ui/layout";

import { GamesProvider } from '../providers/GamesProvider';
import { GameGrid } from '../components/GameGrid';
import { AddGameInput } from '../components/AddGameInput';
import { NoGamesYet } from '../components/NoGamesYet';
import { TagProvider } from '../providers/TagProvider';
import { Filter } from '../components/Filter';

const Home: NextPage = () => {
  return (
    <GamesProvider>
      <TagProvider>
      <Box>
        <NoGamesYet />
          <Flex justify={["space-between", "center"]} align="center" position="relative" pl="0.5rem" pr="0.5rem">
            <Box width={["80%", "70%", "70%", "30%"]} >
              <AddGameInput />
            </Box>
            <Box position={["initial", "initial", "absolute"]} ml="1rem" right="1rem" top="0">
              <Filter />
            </Box>
          </Flex>
        <GameGrid />
      </Box>
      </TagProvider>
    </GamesProvider>
  )
}

export default Home
