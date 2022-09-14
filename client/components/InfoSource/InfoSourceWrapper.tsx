import {
    Box,
    Flex,
    Text,
    Tooltip
} from "@chakra-ui/react";
import { InfoSourceState } from "@game-watch/shared";
import React, { PropsWithChildren } from "react";

import { useInfoSourceContext } from "../../providers/InfoSourceProvider";
import { LoadingSpinner } from "../LoadingSpinner";
import { InfoSourceOptions } from "./InfoSourceOptions";
import { SourceTypeLogo } from "./SourceTypeLogo";

export const InfoSourceWrapper: React.FC<PropsWithChildren> = ({ children }) => {
    const { source } = useInfoSourceContext();

    return (
        <Flex key={source.id} py="1rem" minHeight="4.8rem" align="center" justify="space-between">
            <Tooltip label={source.remoteGameName} placement="top">
                <Box flex="1">
                    <a href={source.data?.url} target="_blank" rel="noreferrer">
                        {SourceTypeLogo[source.type]}
                    </a>
                </Box>
            </Tooltip>
            {[InfoSourceState.Found, InfoSourceState.Initial].includes(source.state) && <Box flex="2" position="relative"><LoadingSpinner size="lg" /></Box>}
            {source.state === InfoSourceState.Error && <Text flex="1" fontSize="lg" color="tomato">Resolve error</Text>}
            {source.state === InfoSourceState.Resolved && children}
            <Box><InfoSourceOptions /></Box>
        </Flex>
    );
};

