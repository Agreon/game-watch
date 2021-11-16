import React from "react"
import { StoreInfoSource } from "./StoreInfoSource"
import { MetacriticInfoSource } from "./MetacriticInfoSource"
import steamLogo from '../../assets/steam.svg';
import switchLogo from '../../assets/switch.png';
import psLogo from '../../assets/playstation.svg';
import epicLogo from "../../assets/epic";
import Image from 'next/image';
import { Flex } from "@chakra-ui/layout"
import { Text, } from "@chakra-ui/react";
import { InfoSourceType, MetacriticData } from "@game-watch/shared";
import { useInfoSourceContext } from "../../providers/InfoSourceProvider";

// TODO: Type discrimination does not work
export const InfoSource: React.FC = () => {
    const { source } = useInfoSourceContext();

    switch (source.type) {
        case InfoSourceType.Steam:
            return <StoreInfoSource
                data={source.data}
                name={
                    <Flex align="end">
                        <Image alt="source-icon" priority={true} src={steamLogo} height="30px" width="30px" />
                        <Text fontWeight="bold" ml="0.5rem">Steam</Text>
                    </Flex>
                }
                expectedDateFormats={["D MMM, YYYY", "D MMMM, YYYY"]} />
        case InfoSourceType.Switch:
            return <StoreInfoSource
                data={source.data}
                name={
                    <Flex align="center">
                        <Image alt="source-icon" priority={true} src={switchLogo} height="30px" width="30px" />
                        <Text fontWeight="bold" ml="0.5rem">Switch</Text>
                    </Flex>
                }
                expectedDateFormats={["DD.MM.YYYY"]} />
        case InfoSourceType.PsStore:
            return <StoreInfoSource
                data={source.data}
                name={
                    <Flex align="end">
                        <Image alt="source-icon" priority={true} src={psLogo} height="30px" width="30px" />
                        <Text fontWeight="bold" ml="0.5rem">PS Store</Text>
                    </Flex>
                }
                expectedDateFormats={["D.M.YYYY"]} />
        case InfoSourceType.Epic:
            return <StoreInfoSource
                data={source.data}
                name={
                    <Flex align="ce">
                        <Image alt="source-icon" priority={true} src={epicLogo} height="30px" width="30px" />
                        <Text fontWeight="bold" ml="0.5rem">Epic</Text>
                    </Flex>
                }
                expectedDateFormats={["YYYY-MM-DD"]} />
        case InfoSourceType.Metacritic:
            return <MetacriticInfoSource data={source.data as MetacriticData} />;
    }
}
