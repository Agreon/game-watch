import React from "react"
import { Flex, Box } from "@chakra-ui/layout"
import { Text, Tooltip } from "@chakra-ui/react";
import { LoadingSpinner } from "../LoadingSpinner";
import { InfoSourceOptions } from "./InfoSourceOptions";
import { useInfoSourceContext } from "../../providers/InfoSourceProvider";

interface InfoSourceWrapperParams {
    name: React.ReactElement;
}

export const InfoSourceWrapper: React.FC<InfoSourceWrapperParams> = ({ name, children }) => {
    const { source } = useInfoSourceContext();

    return (
        <Flex key={source.id} py="1rem" minHeight="4.8rem" align="center" justify="space-between">
            <Tooltip label={source.data?.fullName} placement="top">
                <Box flex="1">
                    <a href={source.data?.url} target="_blank" rel="noreferrer">
                        {name}
                    </a>
                </Box>
            </Tooltip>
            {source.syncing ? (
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