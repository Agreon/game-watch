import Image from 'next/image';
import steamLogo from '../../assets/steam.svg';
import switchLogo from '../../assets/switch.png';
import psLogo from '../../assets/playstation.svg';
import epicLogo from "../../assets/epic";
import metacriticLogo from "../../assets/metacritic.svg";
import { InfoSourceType } from '@game-watch/shared';
import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

export const SourceTypeLogoWithName: Record<InfoSourceType, React.ReactElement> = {
    [InfoSourceType.Steam]: (
        <Flex align="center" pl="0.25rem" pr="0.5rem">
            <Box position="relative" width="30px" height="30px">
                <Box position="absolute" width="25px" height="25px" top="2.5px" left="2.5px">
                    <Image alt="source-icon" priority={true} src={steamLogo} quality={100} height="25px" width="25px" />
                </Box>
            </Box>
            <Text fontWeight="bold" ml="0.25rem" mt="0.25rem">Steam</Text>
        </Flex>
    ),
    [InfoSourceType.Switch]: (
        <Flex align="center" pl="0.25rem" pr="0.5rem">
            <Box position="relative" width="30px" height="30px">
                <Box position="absolute" width="25px" height="25px" top="2.5px" left="2.5px">
                    <Image alt="source-icon" priority={true} src={switchLogo} quality={100} height="25px" width="25px" />
                </Box>
            </Box>
            <Text fontWeight="bold" ml="0.25rem" mt="0.25rem">Switch</Text>
        </Flex>
    ),
    [InfoSourceType.PsStore]: (
        <Flex align="center" pl="0.25rem" pr="0.5rem">
            <Box position="relative" width="30px" height="30px">
                <Box position="absolute" width="35px" height="35px" top="-2.5px" left="-2.5px">
                    <Image alt="source-icon" priority={true} src={psLogo} quality={100} height="35px" width="35px" />
                </Box>
            </Box>
            <Text fontWeight="bold" ml="0.5rem" mt="0.25rem">PS Store</Text>
        </Flex>
    ),
    [InfoSourceType.Epic]: (
        <Flex align="center" pl="0.25rem" pr="0.5rem">
            <Box position="relative" width="30px" height="30px">
                <Box position="absolute" width="25px" height="25px" top="2.5px" left="2.5px">
                    <Image alt="source-icon" priority={true} src={epicLogo} quality={100} height="25px" width="25px" />
                </Box>
            </Box>
            <Text fontWeight="bold" ml="0.5rem" mt="0.25rem">Epic</Text>
        </Flex>
    ),
    [InfoSourceType.Metacritic]: (
        <Flex align="center" pl="0.25rem" pr="0.5rem">
            <Box position="relative" width="30px" height="30px">
                <Box position="absolute" width="27px" height="27px" top="1.25px" left="1.25px">
                    <Image alt="source-icon" priority={true} src={metacriticLogo} quality={100} height="27px" width="27px" />
                </Box>
            </Box>
            <Text fontWeight="bold" ml="0.5rem" mt="0.25rem">Metacritic</Text>
        </Flex>
    )
}


export const SourceTypeLogo: Record<InfoSourceType, React.ReactElement> = {
    [InfoSourceType.Steam]: (
        <Flex align="end">
            <Image alt="source-icon" priority={true} src={steamLogo} quality={100} height="30px" width="30px" />
        </Flex>
    ),
    [InfoSourceType.Switch]: (
        <Flex align="center">
            <Image alt="source-icon" priority={true} src={switchLogo} quality={100} height="30px" width="30px" />
        </Flex>
    ),
    [InfoSourceType.PsStore]: (
        <Flex align="end">
            <Image alt="source-icon" priority={true} src={psLogo} quality={100} height="30px" width="30px" />
        </Flex>
    ),
    [InfoSourceType.Epic]: (
        <Flex align="center">
            <Image alt="source-icon" priority={true} src={epicLogo} quality={100} height="30px" width="30px" />
        </Flex>
    ),
    [InfoSourceType.Metacritic]: (
        <Flex align="center">
            <Image alt="metacritic" priority={true} src={metacriticLogo} quality={100} height="30px" width="30px" />
        </Flex>
    )
}


export const SourceTypeLogoSmall: Record<InfoSourceType, React.ReactElement> = {
    [InfoSourceType.Steam]: (
        <Flex align="start" mt="-0.2rem">
            <Image alt="source-icon" priority={true} src={steamLogo} quality={100} height="20px" width="20px" />
        </Flex>
    ),
    [InfoSourceType.Switch]: (
        <Flex align="center" mt="-0.2rem">
            <Image alt="source-icon" priority={true} src={switchLogo} quality={100} height="20px" width="20px" />
        </Flex>
    ),
    [InfoSourceType.PsStore]: (
        <Flex align="start" mt="-0.2rem">
            <Image alt="source-icon" priority={true} src={psLogo} quality={100} height="22px" width="22px" />
        </Flex>
    ),
    [InfoSourceType.Epic]: (
        <Flex align="center">
            <Image alt="source-icon" priority={true} src={epicLogo} quality={100} height="20px" width="20px" />
        </Flex>
    ),
    [InfoSourceType.Metacritic]: (
        <Flex align="start" mt="-0.2rem">
            <Image alt="metacritic" priority={true} src={metacriticLogo} quality={100} height="20px" width="20px" />
        </Flex>
    )
}
