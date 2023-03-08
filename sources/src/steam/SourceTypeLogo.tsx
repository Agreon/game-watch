import { Box, Flex, Text } from '@chakra-ui/react';
import Image from 'next/image';
import React from 'react';

import steamLogo from './assets/steam.svg';

export const SourceTypeLogo: React.FC = () => {
    return (
        <Flex align="center" pl="0.25rem" pr="0.5rem">
            <Box position="relative" width="30px" height="30px">
                <Box position="absolute" width="25px" height="25px" top="2.5px" left="2.5px">
                    <Image alt="source-icon" priority={true} src={steamLogo} quality={100} height="25px" width="25px" />
                </Box>
            </Box>
            <Text fontWeight="bold" ml="0.25rem" mt="0.25rem">Steam</Text>
        </Flex>
    );
};
