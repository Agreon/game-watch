import type { NextPage } from 'next'
import React from 'react'
import { Box, Flex } from "@chakra-ui/layout";

import { GamesProvider } from '../providers/GamesProvider';
import { GameGrid } from '../components/GameGrid';
import { AddGameInput } from '../components/AddGameInput';
import { NoGamesYet } from '../components/NoGamesYet';
import { TagProvider } from '../providers/TagProvider';
import { Filter } from '../components/Filter';
import { useUserContext } from '../providers/UserProvider';
import { ConfigureUserSettings } from '../components/ConfigureUserSettings';

const Home: NextPage = () => {
  const { user } = useUserContext()

  return (
    <GamesProvider>
      <TagProvider>
        {user.interestedInSources.length === 0 ?
          <ConfigureUserSettings />
          : (
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
          )}

      </TagProvider>
    </GamesProvider>
  )
}

export default Home
