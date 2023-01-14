import { Alert, AlertIcon, Box, Flex, useToast } from '@chakra-ui/react';
import { UserState } from '@game-watch/shared';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import { AddGameInput } from '../components/AddGameInput';
import { ConfigureUserSettings } from '../components/ConfigureUserSettings';
import { Filter } from '../components/Filter';
import { GameGrid } from '../components/GameGrid';
import { NoGamesYet } from '../components/NoGamesYet';
import { GamesProvider } from '../providers/GamesProvider';
import { TagProvider } from '../providers/TagProvider';
import { useUserContext } from '../providers/UserProvider';
import { DEFAULT_TOAST_OPTIONS } from '../util/default-toast-options';

const Home: NextPage = () => {
  const { user } = useUserContext();
  const router = useRouter();
  const toast = useToast(DEFAULT_TOAST_OPTIONS);

  useEffect(() => {
    if (router.query.mailConfirmed) {
      toast({
        title: 'Success',
        description: 'Your email address was confirmed!',
        status: 'success',
      });
    }
    if (router.query.unsubscribed) {
      toast({
        title: 'Success',
        description: "You've successfully unsubscribed!",
        status: 'success',
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
              {
                user.state === UserState.Trial &&
                <Flex justify="center" mb="1.5rem">
                  <Alert status="warning" width={['90%', '90%', '90%', '70%']}>
                    <AlertIcon />
                    You are currently using this site with a trial account. If your browser
                    cache is cleared, your data will not be accessible anymore. We also delete
                    trial accounts that were inactive for 30 days. Register now to create
                    a free account and save your data.
                  </Alert>
                </Flex>
              }
              <Flex
                justify={['space-between', 'center']}
                align="center"
                position="relative"
                pl="0.5rem"
                pr="0.5rem"
              >
                <Box width={['80%', '70%', '70%', '30%']} >
                  <AddGameInput />
                </Box>
                <Box position={['initial', 'initial', 'absolute']} ml="1rem" right="1rem" top="0">
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
