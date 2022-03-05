import Image from 'next/image';
import steamLogo from '../../assets/steam.svg';
import switchLogo from '../../assets/switch.png';
import psLogo from '../../assets/playstation.svg';
import epicLogo from "../../assets/epic";
import metacriticLogo from "../../assets/metacritic.svg";
import { InfoSourceType } from '@game-watch/shared';
import React from 'react';
import { Flex, Text } from '@chakra-ui/react';

export const SourceTypeLogo: Record<InfoSourceType, React.ReactElement> = {
    [InfoSourceType.Steam]: (
        <Flex align="end">
            <Image alt="source-icon" priority={true} src={steamLogo} quality={100} height="30px" width="30px" />
            <Text fontWeight="bold" ml="0.5rem">Steam</Text>
        </Flex>
    ),
    [InfoSourceType.Switch]: (
        <Flex align="center">
            <Image alt="source-icon" priority={true} src={switchLogo} quality={100} height="30px" width="30px" />
            <Text fontWeight="bold" ml="0.5rem">Switch</Text>
        </Flex>
    ),
    [InfoSourceType.PsStore]: (
        <Flex align="end">
            <Image alt="source-icon" priority={true} src={psLogo} quality={100} height="30px" width="30px" />
            <Text fontWeight="bold" ml="0.5rem">PS Store</Text>
        </Flex>
    ),
    [InfoSourceType.Epic]: (
        <Flex align="center">
            <Image alt="source-icon" priority={true} src={epicLogo} quality={100} height="30px" width="30px" />
            <Text fontWeight="bold" ml="0.5rem">Epic</Text>
        </Flex>
    ),
    [InfoSourceType.Metacritic]: (
        <Flex align="center">
            <Image alt="metacritic" priority={true} src={metacriticLogo} quality={100} height="30px" width="30px" />
            <Text fontWeight="bold" ml="0.5rem">Metacritic</Text>
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
