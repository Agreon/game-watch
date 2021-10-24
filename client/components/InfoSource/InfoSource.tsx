import React from "react"
import { StoreInfoSource } from "./StoreInfoSource"
import { InfoSourceType } from "../../providers/GamesProvider"
import { MetacriticInfoSource } from "./MetacriticInfoSource"
import steamLogo from '../../assets/steam.svg';
import switchLogo from '../../assets/switch.png';
import psLogo from '../../assets/playstation.svg';
import epicLogo from "../../assets/epic";
import Image from 'next/image';
import { Flex } from "@chakra-ui/layout"
import { Text, } from "@chakra-ui/react";

export const InfoSource: React.FC<{ type: InfoSourceType }> = ({ type }) => {
    switch (type) {
        case "steam":
            return <StoreInfoSource
                name={
                    <Flex align="end">
                        <Image alt="source-icon" priority={true} src={steamLogo} height="30px" width="30px" />
                        <Text fontWeight="bold" ml="0.5rem">Steam</Text>
                    </Flex>
                }
                expectedDateFormats={["D MMM, YYYY", "D MMMM, YYYY"]} />
        case "switch":
            return <StoreInfoSource
                name={
                    <Flex align="center">
                        <Image alt="source-icon" priority={true} src={switchLogo} height="30px" width="30px" />
                        <Text fontWeight="bold" ml="0.5rem">Switch</Text>
                    </Flex>
                }
                expectedDateFormats={["DD.MM.YYYY"]} />
        case "psStore":
            return <StoreInfoSource
                name={
                    <Flex align="end">
                        <Image alt="source-icon" priority={true} src={psLogo} height="30px" width="30px" />
                        <Text fontWeight="bold" ml="0.5rem">PS Store</Text>
                    </Flex>
                }
                expectedDateFormats={["D.M.YYYY"]} />
        case "epic":
            return <StoreInfoSource
                name={
                    <Flex align="ce">
                        <Image alt="source-icon" priority={true} src={epicLogo} height="30px" width="30px" />
                        <Text fontWeight="bold" ml="0.5rem">Epic</Text>
                    </Flex>
                }
                expectedDateFormats={["YYYY-MM-DD"]} />
        default:
            return <MetacriticInfoSource />;
    }
}
