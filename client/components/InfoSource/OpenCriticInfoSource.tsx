import {
    Box,
    Stat,
    StatLabel,
    StatNumber,
    Text,
} from '@chakra-ui/react';
import { OpenCriticData, OpenCriticRating } from '@game-watch/shared';
import React, { useMemo } from 'react';

import { InfoSourceWrapper } from './InfoSourceWrapper';

const getOpenCriticScoreColor = (rating: OpenCriticRating) => {
    switch (rating) {
        case 'mighty':
            return '#fc430a';
        case 'strong':
            return '#9e00b4';
        case 'fair':
            return '#4aa1ce';
        case 'weak':
            return '#80b06a';
    }
};

const Score: React.FC<{ score: number, rating: OpenCriticRating }> = ({ score, rating }) => {
    const scoreColor = useMemo(() => getOpenCriticScoreColor(rating), [rating]);

    return (
        <StatNumber pl="2rem">
            <Text
                display="initial"
                fontSize='1rem'
                py='0.4rem'
                px="0.4rem"
                bg={scoreColor}
            >
                {score}
            </Text>
        </StatNumber>
    );
};

export const OpenCriticInfoSource: React.FC<{ data: OpenCriticData }> = ({ data }) => {
    return (
        <InfoSourceWrapper>
            <Box flex="1">
                <Stat>
                    <StatLabel>Critic Average</StatLabel>
                    <Score score={data.criticScore} rating={data.rating} />
                </Stat>
            </Box>
            <Box flex="1">
                <Stat>
                    <StatLabel>Recommended</StatLabel>
                    <Score score={data.recommendedBy} rating={data.rating} />
                </Stat>
            </Box>
        </InfoSourceWrapper>
    );
};
