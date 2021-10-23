import { Flex, Box } from "@chakra-ui/layout"
import {
    Stat,
    StatLabel,
    StatNumber,
    Text,
} from "@chakra-ui/react";
import React, { useMemo } from "react";
import { InfoSourceWrapper } from "./InfoSourceWrapper";
import metacriticLogo from '../../assets/metacritic.svg';
import Image from 'next/image'
import { useInfoSourceContext } from "../../providers/InfoSourceProvider";

const getMetaCriticScoreColor = (score: number) => {
    if (isNaN(score)) {
        return "rgb(53, 57, 59)";
    }

    if (score > 70) {
        return "rgb(102, 163, 41)";
    }

    if (score > 50) {
        return "rgb(173, 130, 0)";
    }

    return "rgb(204, 0, 0)";
}

const Score: React.FC<{ score: number }> = ({ score }) => {
    const scoreColor = useMemo(() => getMetaCriticScoreColor(score), [score]);

    return (
        <StatNumber pl="1.2rem">
            <Text display="initial" fontSize={isNaN(score) ? "0.9rem" : "1rem"} py={isNaN(score) ? "0.6rem" : "0.4rem"} px="0.4rem" bg={scoreColor}>
                {isNaN(score) ? "TBD" : score}
            </Text>
        </StatNumber>
    )
}

// TODO: is jumping on loading state
export const MetacriticInfoSource: React.FC = () => {
    const { source } = useInfoSourceContext();

    return (
        <InfoSourceWrapper
            name={
                <Flex align="center">
                    <Image src={metacriticLogo} alt="metacritic" height="30px" width="30px" />
                    <Text fontWeight="bold" ml="0.5rem">Metacritic</Text>
                </Flex>
            }
        >
            <Box flex="1">
                <Stat>
                    <StatLabel>Critic Score</StatLabel>
                    <Score score={parseInt(source.data!.criticScore)} />
                </Stat>
            </Box>
            <Box flex="1">
                <Stat>
                    <StatLabel>User Score</StatLabel>
                    <Score score={parseInt(source.data!.userScore) * 10} />
                </Stat>
            </Box>
        </InfoSourceWrapper>
    )

}
