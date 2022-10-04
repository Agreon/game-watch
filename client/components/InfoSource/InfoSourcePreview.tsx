import { DeleteIcon } from '@chakra-ui/icons';
import {
    Box,
    Flex,
    IconButton,
    Text,
    useColorModeValue
} from '@chakra-ui/react';
import { InfoSourceState } from '@game-watch/shared';
import React, { useCallback } from 'react';

import { useInfoSourceContext } from '../../providers/InfoSourceProvider';
import { SourceTypeLogo } from './SourceTypeLogo';

export const InfoSourcePreview: React.FC = () => {
    const { source, disableInfoSource } = useInfoSourceContext();
    const onRemove = useCallback(() => disableInfoSource(true), [disableInfoSource]);

    return (
        <Flex
            direction={['column', 'column', 'row']}
            align={['start', 'start', 'center']}
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
            <Box flex="0.5" mb={['0.7rem', '0.7rem', '0']}>
                <a href={source.data.url} target="_blank" rel="noreferrer">
                    {SourceTypeLogo[source.type]}
                </a>
            </Box>
            <Flex
                flex="2"
                justify="space-between"
                align="center"
                width="100%"
                overflow="hidden"
            >
                <Box maxWidth="85%">
                    {source.state === InfoSourceState.Error
                        && <Text flex="1" fontSize="lg" color="tomato">Resolve error</Text>}
                    {[InfoSourceState.Found, InfoSourceState.Resolved].includes(source.state) &&
                        <a href={source.data.url} target="_blank" rel="noreferrer">
                            <Text
                                fontWeight="bold"
                                fontSize="xl"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                whiteSpace={['normal', 'normal', 'nowrap']}
                            >
                                {source.data.fullName}
                            </Text>
                        </a>
                    }
                </Box>
                <Box pl="0.5rem">
                    <IconButton aria-label='Delete' onClick={onRemove} icon={<DeleteIcon />} />
                </Box>
            </Flex>
        </Flex>
    );
};
