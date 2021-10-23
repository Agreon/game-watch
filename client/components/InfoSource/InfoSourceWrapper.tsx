import React from "react"
import { InfoSource as Source } from "../../providers/GamesProvider"
import { Flex, Box } from "@chakra-ui/layout"
import { Text, Tooltip } from "@chakra-ui/react";
import { LoadingSpinner } from "../LoadingSpinner";
import { InfoSourceOptions } from "./InfoSourceOptions";

interface InfoSourceWrapperParams {
    source: Source;
    header: React.ReactElement;
}

export const InfoSourceWrapper: React.FC<InfoSourceWrapperParams> = ({ source, header, children }) => {
    return (
        <Flex key={source.id} py="1rem" minHeight="4.8rem" align="center" justify="space-between">
            <Tooltip label={source.data?.fullName} placement="top">
                <Box flex="1">
                    <a href={source.data?.url} target="_blank" rel="noreferrer">
                        {header}
                    </a>
                </Box>
            </Tooltip>
            {source.loading ? (
                <Box flex="2" position="relative"><LoadingSpinner size="lg" /></Box>
            ) : (
                <>
                    {source.resolveError && <Text flex="1" fontSize="lg" color="tomato">Resolve error</Text>}
                    {!source.resolveError && source.data !== null && children}
                </>
            )}
            <Box><InfoSourceOptions source={source} /></Box>
        </Flex>
    )
}