import type { NextPage } from 'next'
import React, { useCallback, useMemo, useState } from 'react'
import { Box, Flex } from "@chakra-ui/layout";
import { useColorModeValue } from "@chakra-ui/react";

import { GamesProvider } from '../providers/GamesProvider';
import { GameGrid } from '../components/GameGrid';
import { AddGameInput } from '../components/AddGameInput';
import { NoGamesYet } from '../components/NoGamesYet';
import { TagProvider } from '../providers/TagProvider';
import { Filter } from '../components/Filter';
import { useUserContext } from '../providers/UserProvider';
import { InfoSourceType } from '@game-watch/shared';
import { Button } from '@chakra-ui/react';
import { SourceTypeLogoWithName } from '../components/InfoSource/SourceTypeLogo';
import { INFO_SOURCE_PRIORITY } from '../providers/GameProvider';

interface InfoSourceWithToggleState {
  type: InfoSourceType
  toggled: boolean
}

const Home: NextPage = () => {
  const { user } = useUserContext()
  const [filterInfoSources, setFilterInfoSources] = useState(INFO_SOURCE_PRIORITY);

  const sourcesWithToggleState = useMemo(() => {
    return INFO_SOURCE_PRIORITY.map(source => ({
      type: source,
      toggled: filterInfoSources.some(type => type === source)
    }));
  }, [filterInfoSources]);

  const toggleInfoSource = useCallback(async (selectedSource: InfoSourceWithToggleState) => {
    if (selectedSource.toggled) {
      setFilterInfoSources(sources => [...sources].filter(source => source !== selectedSource.type))
    } else {
      setFilterInfoSources(sources => [...sources, selectedSource.type])
    }
  }, [setFilterInfoSources]);

  return (
    <GamesProvider>
      <TagProvider>
        {user.interestedInSources.length === 0 && (
          <Box>
            Before you start
            Please select wich information sources you are interested in
            <Flex>
              {sourcesWithToggleState.map(source => (
                <Box
                  bg={useColorModeValue('white', 'gray.800')}
                  borderColor={source.toggled ? "teal" : "none"}
                  borderWidth='2px'
                  borderRadius='lg'
                  mx="0.5rem"
                  my="0.25rem"
                  p="0.5rem"
                  cursor="pointer"
                  key={source.type}
                  onClick={() => toggleInfoSource(source)}
                >
                  {SourceTypeLogoWithName[source.type]}
                </Box>
              ))}
            </Flex>
            <Button>
              Continue
            </Button>
          </Box>
        )}
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
