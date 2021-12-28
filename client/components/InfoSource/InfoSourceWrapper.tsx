import React, { useCallback } from "react"
import { Flex, Box } from "@chakra-ui/layout"
import {
    IconButton,
    Text,
    Tooltip,
    useColorModeValue
} from "@chakra-ui/react";
import { LoadingSpinner } from "../LoadingSpinner";
import { InfoSourceOptions } from "./InfoSourceOptions";
import { useInfoSourceContext } from "../../providers/InfoSourceProvider";
import { SourceTypeLogo } from "./SourceTypeLogo";
import { DeleteIcon } from "@chakra-ui/icons";

export const InfoSourceWrapper: React.FC = ({ children }) => {
    const { source } = useInfoSourceContext();

    return (
        <Flex key={source.id} py="1rem" minHeight="4.8rem" align="center" justify="space-between">
            <Tooltip label={source.data?.fullName} placement="top">
                <Box flex="1">
                    <a href={source.data?.url} target="_blank" rel="noreferrer">
                        {SourceTypeLogo[source.type]}
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
            <Box><InfoSourceOptions /></Box>
        </Flex>
    )
}

// TODO: Responsiveness below 540px => Let store-logo flow above?
export const PreviewInfoSourceWrapper: React.FC = ({ children }) => {
    const { source, disableInfoSource } = useInfoSourceContext();
    const onRemove = useCallback(() => disableInfoSource(), [disableInfoSource]);

    return (
        <Flex
            p="1rem"
            pr="1.5rem"
            align="center"
            justify="space-between"
            position="relative"
            minHeight="8rem"
            bg={useColorModeValue('white', 'gray.800')}
            borderWidth="1px"
            rounded="lg"
            shadow="lg"
            boxShadow="xl"
            _hover={{
                // borderColor: useColorModeValue("grey", "white")
            }}
            transition="border-color 0.15s ease"
        >
            <Box flex="0.8">
                <a href={source.data?.url} target="_blank" rel="noreferrer">
                    {SourceTypeLogo[source.type]}
                </a>
            </Box>
            {source.syncing ? (
                <LoadingSpinner size="lg" disableBackdrop />
            ) : (
                <>
                    {source.resolveError && <Text flex="1" fontSize="lg" color="tomato">Resolve error</Text>}
                    {!source.resolveError && source.data !== null && (
                        <Flex flex="2" direction="column">
                                <Box mb="1rem">
                                    <a href={source.data?.url} target="_blank" rel="noreferrer">
                                        <Text fontWeight="bold" fontSize="xl">{source.data?.fullName}</Text>
                                    </a>
                                </Box>
                            <Flex>
                                {children}
                            </Flex>
                        </Flex>
                    )}
                </>
            )}
            <Box>
                <IconButton aria-label='Delete' onClick={onRemove} icon={<DeleteIcon />} />
            </Box>
        </Flex>
    )
}