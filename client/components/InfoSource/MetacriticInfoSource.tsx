import {
    Box,
    Stat,
    StatLabel,
    StatNumber,
    Text,
} from "@chakra-ui/react";
import { MetacriticData } from "@game-watch/shared";
import React, { useMemo } from "react";

import { InfoSourceWrapper } from "./InfoSourceWrapper";

const getMetaCriticScoreColor = (score: number) => {
    if (isNaN(score)) {
        return "rgb(53, 57, 59)";
    }

    if (score > 74) {
        return "rgb(102, 163, 41)";
    }

    if (score > 49) {
        return "rgb(173, 130, 0)";
    }

    return "rgb(204, 0, 0)";
};

const Score: React.FC<{ score: number, displayScore: number }> = ({ score, displayScore }) => {
    const scoreColor = useMemo(() => getMetaCriticScoreColor(score), [score]);

    return (
        <StatNumber pl="1.2rem">
            <Text display="initial" fontSize={isNaN(displayScore) ? "0.9rem" : "1rem"} py={isNaN(displayScore) ? "0.6rem" : "0.4rem"} px="0.4rem" bg={scoreColor}>
                {isNaN(displayScore) ? "TBD" : displayScore}
            </Text>
        </StatNumber>
    );
};

// TODO: is jumping on loading state
export const MetacriticInfoSource: React.FC<{ data: MetacriticData }> = ({ data }) => {
    return (
        <InfoSourceWrapper>
            <Box flex="1">
                <Stat>
                    <StatLabel>Critic Score</StatLabel>
                    <Score score={parseInt(data.criticScore)} displayScore={parseInt(data.criticScore)} />
                </Stat>
            </Box>
            <Box flex="1">
                <Stat>
                    <StatLabel>User Score</StatLabel>
                    <Score score={parseFloat(data.userScore) * 10} displayScore={parseFloat(data.userScore)} />
                </Stat>
            </Box>
        </InfoSourceWrapper>
    );
};
