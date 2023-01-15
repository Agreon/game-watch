import { Box, Text } from '@chakra-ui/react';
import { ProtonGameData } from '@game-watch/shared';
import { useMemo } from 'react';

import { InfoSourceWrapper } from './InfoSourceWrapper';

export const ProtonDbInfoSource: React.FC<{ data: ProtonGameData }> = ({ data: { score } }) => {
    const backgroundColor = useMemo(() => {
        switch (score) {
            case 'borked': return 'red';
            case 'bronze': return '#cd7f32';
            case 'silver': return '#a6a6a6';
            case 'gold': return '#CFB53B';
            case 'platinum': return '#b4c7dc';
            case 'native': return 'green';
        }
    }, [score]);

    return (
        <InfoSourceWrapper>
            <Box flex="1.5"
                mx={['1rem', '3rem']}
                bg={backgroundColor}
                color={score === 'native' ? 'white' : 'black'}
            >
                <Text
                    textAlign="center"
                    fontSize="lg"
                    textTransform="uppercase"
                    fontWeight="400"
                    fontFamily='"Abel", sans-serif'
                    py="0.25rem"
                    px="2rem"
                >
                    {score}
                </Text>
            </Box>
        </InfoSourceWrapper>
    );
};
