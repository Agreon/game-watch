import { Box, Stat, StatLabel, StatNumber } from '@chakra-ui/react';
import { Country, formatReleaseDate, SteamGameData } from '@game-watch/shared';
import { useMemo } from 'react';

import { InfoSourceWrapper } from './InfoSourceWrapper';
import { Price } from './StoreInfoSource';

export const SteamReleaseDate: React.FC<{
    releaseDate?: Date;
    isEarlyAccess: boolean;
    originalDate?: string
}> = ({ releaseDate, originalDate, isEarlyAccess }) => {
    const formattedDate = useMemo(
        () => {
            const formattedDate = formatReleaseDate({ releaseDate, originalDate });
            if (isEarlyAccess && formattedDate !== 'TBD') {
                return 'In Early Access';
            }
            return formattedDate;
        },
        [releaseDate, originalDate, isEarlyAccess]
    );

    return (
        <Stat>
            <StatLabel>Release Date</StatLabel>
            <StatNumber fontSize="1rem">{formattedDate}</StatNumber>
        </Stat>
    );
};

export const SteamInfoSource: React.FC<{
    data: SteamGameData,
    country: Country
}> = ({ data, country }) => (
    <InfoSourceWrapper>
        <Box flex="1">
            <SteamReleaseDate {...data} />
        </Box>
        <Box flex="1">
            <Price
                price={data.priceInformation?.final}
                initial={data.priceInformation?.initial}
                country={country}
            />
        </Box>
    </InfoSourceWrapper>
);
