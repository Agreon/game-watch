import { DeleteIcon } from "@chakra-ui/icons";
import {
    Box,
    Flex,
    IconButton,
    Text,
    useColorModeValue
} from "@chakra-ui/react";
import React, { useCallback } from "react";

import { useInfoSourceContext } from "../../providers/InfoSourceProvider";
import { LoadingSpinner } from "../LoadingSpinner";
import { SourceTypeLogo } from "./SourceTypeLogo";

export const InfoSourcePreview: React.FC = () => {
    const { source, excludeInfoSource } = useInfoSourceContext();
    const onRemove = useCallback(() => excludeInfoSource(), [excludeInfoSource]);

    return (
        <Flex
            direction={["column", "column", "row"]}
            align={["start", "start", "center"]}
            justify="space-between"
            p="1rem"
            pr="1.5rem"
            minHeight="5rem"
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
            <Box flex="0.5" mb={["0.7rem", "0.7rem", "0"]}>
                <a href={source.data?.url} target="_blank" rel="noreferrer">
                    {SourceTypeLogo[source.type]}
                </a>
            </Box>
            <Flex justify="space-between" flex="2" align="center" width="100%">
                <Box width="100%" position="relative">
                    {!source.syncing && source.resolveError && <Text flex="1" fontSize="lg" color="tomato">Resolve error</Text>}
                    {!source.resolveError &&
                    <>
                        {!source.remoteGameName ? (
                            <LoadingSpinner size="lg" />
                            ) : (
                                <a href={source.data?.url} target="_blank" rel="noreferrer">
                                    <Text fontWeight="bold" fontSize="xl">
                                        {source.remoteGameName}
                                    </Text>
                                </a>
                        )}
                    </>
                }
                </Box>
                <Box pl="0.5rem">
                    <IconButton aria-label='Delete' onClick={onRemove} icon={<DeleteIcon />} />
                </Box>
            </Flex>
        </Flex>
    );
};
