/* eslint-disable @next/next/no-img-element */
import { Flex, Box } from "@chakra-ui/layout"
import {
    Stat,
    StatLabel,
    StatNumber,
    Text,
    Tooltip
} from "@chakra-ui/react";
import React from "react";
import { LoadingSpinner } from "../LoadingSpinner";
import { InfoSourceOptions } from "./InfoSourceOptions";
import { InfoSource } from "../../providers/GamesProvider";

export const MetacriticInfoSource: React.FC<{ source: InfoSource }> = ({ source }) => {
    return (
        <Flex key={source.id} py="1rem" minHeight="4.8rem" align="center" justify="space-between">
            <Tooltip label={source.data?.fullName} placement="top">
                <Box flex="1">
                    <a href={source.data?.url} target="_blank" rel="noreferrer">
                        <Flex align="center">
                            <img src="https://www.metacritic.com/images/icons/metacritic-icon.svg" alt="metacritc" height="30px" width="30px" />
                            <Text fontWeight="bold" ml="0.5rem">Metacritic</Text>
                        </Flex>
                    </a>
                </Box>
            </Tooltip>
            {source.loading ? (
                <Box flex="2" position="relative"><LoadingSpinner size="lg" /></Box>
            ) : (
                <>
                    {source.resolveError && <Text flex="1" fontSize="lg" color="tomato">Resolve error</Text>}
                    {!source.resolveError && source.data !== null &&
                        <>
                            <Box flex="1">
                                <Stat>
                                    <StatLabel>Critic Score</StatLabel>
                                    <StatNumber pl="2rem" fontSize="1rem">{source.data.criticScore}</StatNumber>
                                </Stat>
                            </Box>
                            <Box flex="1">
                                <Stat>
                                    <StatLabel>User Score</StatLabel>
                                    <StatNumber pl="1.3rem" fontSize="1rem">{source.data.userScore}</StatNumber>
                                </Stat>
                            </Box>
                        </>
                    }
                </>
            )}
            <Box><InfoSourceOptions source={source} /></Box>
        </Flex>
    )
}
