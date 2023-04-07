import { Box, Stat, StatLabel, StatNumber, Text, Tooltip } from '@chakra-ui/react';
import { Country, formatReleaseDate, isNonSpecificDate, SteamGameData } from '@game-watch/shared';
import dayjs from 'dayjs';
import { useMemo } from 'react';

import { InfoSourceWrapper } from './InfoSourceWrapper';
import { Price } from './StoreInfoSource';

export const SteamReleaseDate: React.FC<{
    releaseDate?: Date;
    originalDate?: string
    isEarlyAccess: boolean;
}> = ({ releaseDate, originalDate, isEarlyAccess }) => {
    const formattedDate = useMemo(
        () => {
            const formattedDate = formatReleaseDate({ releaseDate, originalDate });
            if (
                !isEarlyAccess
                // If we have no comparable date information, just return that
                || !releaseDate
                || (originalDate && isNonSpecificDate(originalDate))
            ) {
                return formattedDate;
            }

            if (dayjs(releaseDate).isAfter(new Date())) {
                return <Box position="relative" width="fit-content">
                    {formattedDate}
                    <Tooltip placement='top' label="Early Access">
                        <Text position="absolute" fontSize="0.6rem" top="0" right="-1.3rem">(EA)</Text>
                    </Tooltip>
                </Box>;
            }
            return 'In Early Access';
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
