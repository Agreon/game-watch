import React, { useCallback } from "react"
import { Flex, Box } from "@chakra-ui/layout"
import {
    IconButton,
    Text,
    useColorModeValue
} from "@chakra-ui/react";
import { useInfoSourceContext } from "../../providers/InfoSourceProvider";
import { SourceTypeLogo } from "./SourceTypeLogo";
import { DeleteIcon } from "@chakra-ui/icons";

// TODO: Responsiveness below 540px => Let store-logo flow above?
export const InfoSourcePreview: React.FC = () => {
    const { source, disableInfoSource } = useInfoSourceContext();
    const onRemove = useCallback(() => disableInfoSource(), [disableInfoSource]);

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
            <Flex justify="space-between" flex="2" position="relative" align="center" width="100%">
                <Box>
                    <a href={source.data?.url} target="_blank" rel="noreferrer">
                        <Text fontWeight="bold" fontSize="xl">{source.remoteGameName}</Text>
                    </a>
                </Box>
                <Box pl="0.5rem">
                    <IconButton aria-label='Delete' onClick={onRemove} icon={<DeleteIcon />} />
                </Box>
            </Flex>
        </Flex>
    )
}
