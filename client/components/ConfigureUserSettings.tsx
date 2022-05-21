import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Link, Text } from "@chakra-ui/react";
import { Country, InfoSourceType, SupportedCountries } from '@game-watch/shared';
import { Select, SingleValue } from "chakra-react-select";
import React, { useCallback, useMemo, useState } from 'react';

import { INFO_SOURCE_PRIORITY } from '../providers/GameProvider';
import { useUserContext } from '../providers/UserProvider';
import { useAction } from '../util/useAction';
import { InfoSourceFilter } from './InfoSourceFilter';

interface CountryOption {
    value: Country
    label: string
}

const countryLabels: Record<Country, string> = {
    "DE": "Germany",
    "US": "USA"
} as const;

const countryOptions: CountryOption[] = Object.entries(countryLabels).map(
    // Thanks for nothing typescript :/
    ([value, label]) => ({ value: value as Country, label })
);

export const ConfigureUserSettings: React.FC = () => {
    const userContext = useUserContext();
    const { loading, execute: updateUserSettings } = useAction(userContext.updateUserSettings);

    const [userCountry, setUserCountry] = useState<CountryOption>({
        value: "DE",
        label: countryLabels[userContext.user.country]
    });

    const availableInfoSources = useMemo(() => INFO_SOURCE_PRIORITY.filter(
        type => SupportedCountries[type].includes(userCountry.value)
    ), [userCountry]);

    const [filterInfoSources, setFilterInfoSources] = useState<InfoSourceType[]>([]);

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
                                    paddingLeft: "0.5rem",
                                    paddingRight: "0.5rem",
                                }),
                                valueContainer: provided => ({
                                    ...provided,
                                    paddingLeft: "0.5rem"
                                }),
                                indicatorSeparator: () => ({
                                    display: "none"
                                }),
                                control: provided => ({
                                    ...provided,
                                    border: 0,
                                    borderBottom: "1px",
                                    borderRadius: 0,
                                    orderColor: "white",
                                    boxShadow: "none !important",
                                }),
                                option: provided => ({
                                    ...provided,
                                    paddingLeft: "0.5rem"
                                }),
                                menu: provided => ({
                                    ...provided,
                                    padding: 0,
                                    marginTop: 0,
                                }),
                                menuList: provided => ({
                                    ...provided,
                                    padding: 0,
                                    borderRadius: 0,
                                })
                            }}
                            defaultValue={userCountry}
                            onChange={onCountryChanges}
                            options={countryOptions}
                            isSearchable={false}
                        />
                    </Box>
                </Flex>
                <InfoSourceFilter
                    availableInfoSources={availableInfoSources}
                    filterInfoSources={filterInfoSources}
                    setFilterInfoSources={setFilterInfoSources}
                />
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
