import { Box, Flex, Text } from '@chakra-ui/react';
import { InfoSourceType, InfoSourceTypeNames } from '@game-watch/shared';
import Image from 'next/legacy/image';
import React from 'react';

import epicLogo from '../../assets/epic';
import metacriticLogo from '../../assets/metacritic.svg';
import psLogo from '../../assets/playstation.svg';
import protonLogo from '../../assets/protondb.svg';
import steamLogo from '../../assets/steam.svg';
import switchLogo from '../../assets/switch.png';
import xboxLogo from '../../assets/xbox.png';

export const SourceTypeLogoWithName: Record<InfoSourceType, React.ReactElement> = {
    [InfoSourceType.Steam]: (
        <Flex align="center" pl="0.25rem" pr="0.5rem">
            <Box position="relative" width={30} height={30}>
                <Box position="absolute" width={25} height={25} top="2.5px" left="2.5px">
                    <Image
                        alt="source-icon"
                        priority={true}
                        src={steamLogo}
                        quality={100}
                        height={25}
                        width={25}
                    />
                </Box>
            </Box>
            <Text fontWeight="bold" ml="0.25rem" mt="0.25rem">
                {InfoSourceTypeNames[InfoSourceType.Steam]}
            </Text>
        </Flex>
    ),
    [InfoSourceType.Switch]: (
        <Flex align="center" pl="0.25rem" pr="0.5rem">
            <Box position="relative" width={30} height={30}>
                <Box position="absolute" width={25} height={25} top="2.5px" left="2.5px">
                    <Image alt="source-icon" priority={true} src={switchLogo} quality={100} height={25} width={25} />
                </Box>
            </Box>
            <Text fontWeight="bold" ml="0.25rem" mt="0.25rem">
                {InfoSourceTypeNames[InfoSourceType.Switch]}
            </Text>
        </Flex>
    ),
    [InfoSourceType.Playstation]: (
        <Flex align="center" pl="0.25rem" pr="0.5rem">
            <Box position="relative" width={30} height={30}>
                <Box position="absolute" width="35px" height="35px" top="-2.5px" left="-2.5px">
                    <Image alt="source-icon" priority={true} src={psLogo} quality={100} height={35} width={35} />
                </Box>
            </Box>
            <Text fontWeight="bold" ml="0.5rem" mt="0.25rem">
                {InfoSourceTypeNames[InfoSourceType.Playstation]}
            </Text>
        </Flex>
    ),
    [InfoSourceType.Xbox]: (
        <Flex align="center" pl="0.25rem" pr="0.5rem">
            <Box position="relative" width={30} height={30}>
                <Box position="absolute" width="35px" height="35px" top="-2.5px" left="-2.5px">
                    <Image alt="source-icon" priority={true} src={xboxLogo} quality={100} height={35} width={35} />
                </Box>
            </Box>
            <Text fontWeight="bold" ml="0.5rem" mt="0.25rem">
                {InfoSourceTypeNames[InfoSourceType.Xbox]}
            </Text>
        </Flex>
    ),
    [InfoSourceType.Epic]: (
        <Flex align="center" pl="0.25rem" pr="0.5rem">
            <Box position="relative" width={30} height={30}>
                <Box position="absolute" width={25} height={25} top="2.5px" left="2.5px">
                    <Image alt="source-icon" priority={true} src={epicLogo} quality={100} height={25} width={25} />
                </Box>
            </Box>
            <Text fontWeight="bold" ml="0.5rem" mt="0.25rem">
                {InfoSourceTypeNames[InfoSourceType.Epic]}
            </Text>
        </Flex>
    ),
    [InfoSourceType.Metacritic]: (
        <Flex align="center" pl="0.25rem" pr="0.5rem">
            <Box position="relative" width={30} height={30}>
                <Box position="absolute" width="27px" height="27px" top="1.25px" left="1.25px">
                    <Image
                        alt="source-icon"
                        priority={true}
                        src={metacriticLogo}
                        quality={100}
                        height={27}
                        width={27}
                    />
                </Box>
            </Box>
            <Text fontWeight="bold" ml="0.5rem" mt="0.25rem">
                {InfoSourceTypeNames[InfoSourceType.Metacritic]}
            </Text>
        </Flex>
    ),
    [InfoSourceType.Proton]: (
        <Flex align="center" pl="0.25rem" pr="0.5rem">
            <Box position="relative" width={30} height={30}>
                <Box position="absolute" width={25} height={25} top="2.5px" left="2.5px">
                    <Image
                        alt="source-icon"
                        priority={true}
                        src={protonLogo}
                        quality={100}
                        height={25}
                        width={25}
                    />
                </Box>
            </Box>
            <Text fontWeight="bold" ml="0.25rem" mt="0.25rem">
                {InfoSourceTypeNames[InfoSourceType.Proton]}
            </Text>
        </Flex>
    ),
};

export const SourceTypeLogo: Record<InfoSourceType, React.ReactElement> = {
    [InfoSourceType.Steam]: (
        <Flex align="end">
            <Image alt="source-icon" priority={true} src={steamLogo} quality={100} height={30} width={30} />
            <Text fontWeight="bold" ml="0.5rem">
                {InfoSourceTypeNames[InfoSourceType.Steam]}
            </Text>
        </Flex>
    ),
    [InfoSourceType.Switch]: (
        <Flex align="center">
            <Image alt="source-icon" priority={true} src={switchLogo} quality={100} height={30} width={30} />
            <Text fontWeight="bold" ml="0.5rem" mt="0.25rem">
                {InfoSourceTypeNames[InfoSourceType.Switch]}
            </Text>
        </Flex>
    ),
    [InfoSourceType.Playstation]: (
        <Flex align="end">
            <Image alt="source-icon" priority={true} src={psLogo} quality={100} height={30} width={30} />
            <Text fontWeight="bold" ml="0.5rem">
                {InfoSourceTypeNames[InfoSourceType.Playstation]}
            </Text>
        </Flex>
    ),

    [InfoSourceType.Xbox]: (
        <Flex align="end">
            <Image alt="source-icon" priority={true} src={xboxLogo} quality={100} height={30} width={30} />
            <Text fontWeight="bold" ml="0.5rem">
                {InfoSourceTypeNames[InfoSourceType.Xbox]}
            </Text>
        </Flex>
    ),
    [InfoSourceType.Epic]: (
        <Flex align="center">
            <Image alt="source-icon" priority={true} src={epicLogo} quality={100} height={30} width={30} />
            <Text fontWeight="bold" ml="0.5rem">
                {InfoSourceTypeNames[InfoSourceType.Epic]}
            </Text>
        </Flex>
    ),
    [InfoSourceType.Metacritic]: (
        <Flex align="center">
            <Image alt="metacritic" priority={true} src={metacriticLogo} quality={100} height={30} width={30} />
            <Text fontWeight="bold" ml="0.5rem" mt="0.25rem">
                {InfoSourceTypeNames[InfoSourceType.Metacritic]}
            </Text>
        </Flex>
    ),
    [InfoSourceType.Proton]: (
        <Flex align="end">
            <Image alt="source-icon" priority={true} src={protonLogo} quality={100} height={30} width={30} />
            <Text fontWeight="bold" ml="0.5rem">
                {InfoSourceTypeNames[InfoSourceType.Proton]}
            </Text>
        </Flex>
    )
};

export const SourceTypeLogoSmall: Record<InfoSourceType, React.ReactElement> = {
    [InfoSourceType.Steam]: (
        <Flex align="start" mt="-0.2rem">
            <Image alt="source-icon" priority={true} src={steamLogo} quality={100} height={20} width={20} />
        </Flex>
    ),
    [InfoSourceType.Switch]: (
        <Flex align="center" mt="-0.2rem">
            <Image alt="source-icon" priority={true} src={switchLogo} quality={100} height={20} width={20} />
        </Flex>
    ),
    [InfoSourceType.Playstation]: (
        <Flex align="start" mt="-0.2rem">
            <Image alt="source-icon" priority={true} src={psLogo} quality={100} height={22} width={22} />
        </Flex>
    ),
    [InfoSourceType.Xbox]: (
        <Flex align="start" mt="-0.2rem">
            <Image alt="source-icon" priority={true} src={xboxLogo} quality={100} height={22} width={22} />
        </Flex>
    ),
    [InfoSourceType.Epic]: (
        <Flex align="center">
            <Image alt="source-icon" priority={true} src={epicLogo} quality={100} height={20} width={20} />
        </Flex>
    ),
    [InfoSourceType.Metacritic]: (
        <Flex align="start" mt="-0.2rem">
            <Image alt="metacritic" priority={true} src={metacriticLogo} quality={100} height={20} width={20} />
        </Flex>
    ),
    [InfoSourceType.Proton]: (
        <Flex align="start" mt="-0.2rem">
            <Image alt="source-icon" priority={true} src={protonLogo} quality={100} height={20} width={20} />
        </Flex>
    )
};
