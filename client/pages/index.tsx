import type { NextPage } from 'next'
import React from 'react'
import { Box, Flex } from "@chakra-ui/layout";

import { GamesProvider } from '../providers/GamesProvider';
import { GameGrid } from '../components/GameGrid';
import { AddGame } from '../components/AddGame';
import { NoGamesYet } from '../components/NoGamesYet';
import { TagProvider } from '../providers/TagProvider';
import { Filter } from '../components/Filter';

const Home: NextPage = () => {
  return (
    <GamesProvider>
      <TagProvider>
      <Box>
        <NoGamesYet />
          <Flex justify="center" position="relative">
            <Box width={["70%", "70%", "70%", "30%"]} ml={["0rem", "0rem", "0rem", "6rem"]}>
              <AddGame />
            </Box>
            <Filter />
        </Flex>
        <GameGrid />
      </Box>
      </TagProvider>
    </GamesProvider>
  )
}

export default Home
