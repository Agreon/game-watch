import { Box, Text, Tooltip } from '@chakra-ui/react';
import { DeckVerified, ProtonDbScore, ProtonGameData } from '@game-watch/shared';
import Image from 'next/image';
import { useMemo } from 'react';

import { InfoSourceWrapper } from './InfoSourceWrapper';

const scoreColorMap: Record<ProtonDbScore, string> = {
    borked: 'red',
    bronze: '#cd7f32',
    silver: '#a6a6a6',
    gold: '#CFB53B',
    platinum: '#b4c7dc',
    native: 'green',
};

/* eslint-disable max-len */
const verifierStatusIconMap: Record<DeckVerified, string> = {
    unsupported: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/steamworks_docs/english/unsupported_50.png',
    playable: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/steamworks_docs/english/playable_50_1.png',
    verified: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/steamworks_docs/english/verified_50.png',
    unknown: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/steamworks_docs/english/unknown_50_1.png',
};
/* eslint-enable max-len */

export const ProtonDbInfoSource: React.FC<{ data: ProtonGameData }> = ({
    data: { score, deckVerified, url }
}) => {
    const backgroundColor = useMemo(() => scoreColorMap[score], [score]);
    const verifiedIcon = useMemo(() => verifierStatusIconMap[deckVerified], [deckVerified]);

    return (
        <InfoSourceWrapper>
            <Box
                flex="1.5"
                mx={['1rem', '3rem']}
                bg={backgroundColor}
                color={score === 'native' ? 'white' : 'black'}
            >

                <a
                    href={url} target="_blank">
                    <Box
                        position="absolute"
                        ml="5px"
                        mt="5px"
                    >
                        <Tooltip placement='top' label={`Steam Deck: ${deckVerified}`}>
                            <Image
                                alt={deckVerified}
                                src={verifiedIcon}
                                height={25}
                                width={25}
                                style={{
                                    filter: 'invert(100%) saturate(0%) brightness(50%)'
                                }}
                            />
                        </Tooltip>
                    </Box>
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
                </a>
            </Box>
        </InfoSourceWrapper>
    );
};
