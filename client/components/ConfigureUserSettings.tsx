import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Link, Text } from '@chakra-ui/react';
import { Country, InfoSourceType, SupportedCountries } from '@game-watch/shared';
import React, { useCallback, useMemo, useState } from 'react';

import { INFO_SOURCE_PRIORITY } from '../providers/GameProvider';
import { useUserContext } from '../providers/UserProvider';
import { useAction } from '../util/useAction';
import { InfoSourceFilter } from './InfoSourceFilter';
import { CountrySelect } from './UserSettings/CountrySelect';

export const ConfigureUserSettings: React.FC = () => {
    const userContext = useUserContext();
    const { loading, execute: updateUserSettings } = useAction(userContext.updateUserSettings);

    const [interestedInSources, setInterestedInSources] = useState<InfoSourceType[]>([]);
    const [country, setUserCountry] = useState<Country>(userContext.user.country);

    const availableInfoSources = useMemo(
        () => INFO_SOURCE_PRIORITY.filter(type => SupportedCountries[type].includes(country)),
        [country]
    );

    const onUpdateUserSettings = useCallback(async () => {
        await updateUserSettings({
            country,
            interestedInSources,
            email: null,
            enableEmailNotifications: false,
        });
    }, [updateUserSettings, country, interestedInSources]);

    return (
        <Flex px="1rem" justify="center">
            <Box mt={['0', '0', '1rem']}>
                <Text fontSize="4xl" textAlign="center">Welcome to GameWatch!</Text>
                <Text fontSize={['2xl', '2xl', '3xl']} mt="2rem">
                    Before you start, please select the information sources that are relevant for you.
                </Text>
                <Flex
                    align={['start', 'center']}
                    direction={['column', 'row']}
                    mt={['1rem', '1rem', '2rem']}
                    mb="2rem"
                >
                    <Text fontSize={['xl', 'xl', '2xl']}>
                        These are the available sources for
                    </Text>
                    <Box ml={[0, '1rem']} mt={['1rem', 0]} minWidth="10rem">
                        <CountrySelect
                            value={country}
                            onChange={setUserCountry}
                        />
                    </Box>
                </Flex>
                <InfoSourceFilter
                    availableInfoSources={availableInfoSources}
                    filterInfoSources={interestedInSources}
                    setFilterInfoSources={setInterestedInSources}
                />
                <Text mt="2rem">
                    Missing a source or country? Let me know or contribute on
                    <Link href="https://github.com/agreon/game-watch" isExternal ml="0.5rem">
                        <Text as="u">GitHub<ExternalLinkIcon ml='0.2rem' mb="0.2rem" /></Text>
                    </Link>
                </Text>
                <Flex justify="flex-end" my="2rem">
                    <Button
                        size='lg'
                        colorScheme="teal"
                        isLoading={loading}
                        disabled={loading || !interestedInSources.length}
                        onClick={onUpdateUserSettings}
                    >
                        Continue
                    </Button>
                </Flex>
            </Box>
        </Flex>
    );
};
