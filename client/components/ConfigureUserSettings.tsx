import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Flex } from "@chakra-ui/layout";
import { Button,Link, Text, useColorModeValue } from "@chakra-ui/react";
import { Country, InfoSourceType, SupportedCountries } from '@game-watch/shared';
import { Select, SingleValue } from "chakra-react-select";
import React, { useCallback, useMemo, useState } from 'react';

import { INFO_SOURCE_PRIORITY } from '../providers/GameProvider';
import { useUserContext } from '../providers/UserProvider';
import { useAction } from '../util/useAction';
import { SourceTypeLogoWithName } from './InfoSource/SourceTypeLogo';

interface InfoSourceWithToggleState {
    type: InfoSourceType
    toggled: boolean
}

interface CountryOption {
    value: Country
    label: string
}

const countryOptions: Array<CountryOption> = [
    { value: 'DE', label: 'Germany' },
    { value: 'US', label: 'USA' },
];

/**
 * TODO:
 * - Select Input variant = flushed
 * - Other icon usages are broken?
 */
export const ConfigureUserSettings: React.FC = () => {
    const userContext = useUserContext();
    const { loading, execute: updateUserSettings } = useAction(userContext.updateUserSettings);

    const [userCountry, setUserCountry] = useState<CountryOption>({
        value: userContext.user.country,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        label: countryOptions.find(({ value }) => value === userContext.user.country)!.label
    });

    const availableInfoSources = useMemo(() => INFO_SOURCE_PRIORITY.filter(
        type => SupportedCountries[type].includes(userCountry.value)
    ), [userCountry]);

    const [filterInfoSources, setFilterInfoSources] = useState<InfoSourceType[]>([]);

    const sourcesWithToggleState = useMemo(
        () => availableInfoSources.map(source => ({
            type: source,
            toggled: filterInfoSources.some(type => type === source)
        })),
        [availableInfoSources, filterInfoSources]
    );

    const toggleInfoSource = useCallback(async (selectedSource: InfoSourceWithToggleState) => {
        if (selectedSource.toggled) {
            setFilterInfoSources(sources => [...sources].filter(source => source !== selectedSource.type));
        } else {
            setFilterInfoSources(sources => [...sources, selectedSource.type]);
        }
    }, [setFilterInfoSources]);

    // TODO
    const background = useColorModeValue('white', 'gray.800');

    const onCountryChanges = useCallback((newValue: SingleValue<CountryOption>) => {
        if (!newValue) {
            return;
        }
        setUserCountry(newValue);
    }, []);

    const onUpdateUserSettings = useCallback(async () => {
        await updateUserSettings({
            country: userCountry.value,
            interestedInSources: filterInfoSources
        });
    }, [updateUserSettings, userCountry, filterInfoSources]);


    return (
        <Flex px="1rem" justify="center">
            <Box mt={["0", "0", "1rem"]}>
                <Text fontSize="4xl" textAlign="center">Welcome to GameWatch!</Text>
                <Text fontSize={["2xl", "2xl", "3xl"]} mt="2rem">
                    Before you start, please select the information sources that are relevant for you.
                </Text>
                <Flex align={["start", "center"]} direction={["column", "row"]} mt={["1rem", "1rem", "2rem"]} mb="2rem">
                    <Text fontSize={["xl", "xl", "2xl"]}>
                        These are the available sources for
                    </Text>
                    <Box ml={[0, "1rem"]} mt={["1rem", 0]} minWidth="10rem">
                        <Select<CountryOption>
                            chakraStyles={{
                                dropdownIndicator: provided => ({
                                    ...provided,
                                    background: "grey.700",
                                }),
                                indicatorSeparator: () => ({
                                    display: "none"
                                })
                            }}
                            defaultValue={userCountry}
                            onChange={onCountryChanges}
                            options={countryOptions}
                            isSearchable={false}
                        />
                    </Box>
                </Flex>
                <Flex flexWrap="wrap">
                    {sourcesWithToggleState.map(source => (
                        <Box
                            key={source.type}
                            bg={background}
                            borderColor={source.toggled ? "teal.500" : "none"}
                            borderWidth='2px'
                            borderRadius='lg'
                            mx="0.5rem"
                            my="0.25rem"
                            p="0.5rem"
                            cursor="pointer"
                            onClick={() => toggleInfoSource(source)}
                        >
                            {SourceTypeLogoWithName[source.type]}
                        </Box>
                    ))}
                </Flex>
                <Text mt="2rem">
                    Missing a source? Let me know or contribute on
                    <Link href="https://github.com/agreon/game-watch" isExternal ml="0.5rem">
                        <Text as="u">GitHub<ExternalLinkIcon ml='0.2rem' mb="0.2rem" /></Text>
                    </Link>
                </Text>
                <Flex justify="flex-end" my="2rem">
                    <Button
                        size='lg'
                        colorScheme="teal"
                        isLoading={loading}
                        disabled={loading || !filterInfoSources.length}
                        onClick={onUpdateUserSettings}
                    >
                        Continue
                    </Button>
                </Flex>
            </Box>
        </Flex>
    );
};
