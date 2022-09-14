import { Box, Flex, useToast } from "@chakra-ui/react";
import type { NextPage } from 'next';
import { ParsedUrlQuery } from "querystring";
import React, { useEffect } from 'react';

import { AddGameInput } from '../components/AddGameInput';
import { ConfigureUserSettings } from '../components/ConfigureUserSettings';
import { Filter } from '../components/Filter';
import { GameGrid } from '../components/GameGrid';
import { NoGamesYet } from '../components/NoGamesYet';
import { GamesProvider } from '../providers/GamesProvider';
import { TagProvider } from '../providers/TagProvider';
import { useUserContext } from '../providers/UserProvider';
import { DEFAULT_TOAST_OPTIONS } from "../util/default-toast-options";

const Home: NextPage = ({ query }: { query?: ParsedUrlQuery }) => {
  const { user } = useUserContext();
  const toast = useToast(DEFAULT_TOAST_OPTIONS);

  useEffect(() => {
    if (query?.mailConfirmed) {
      toast({
        title: "Success",
        description: "Your email address was confirmed!",
        status: "success",
      });
    }
    if (query?.unsubscribed) {
      toast({
        title: "Success",
        description: "You've successfully unsubscribed!",
        status: "success",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  );
};

export default Home;
