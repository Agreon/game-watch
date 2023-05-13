import {
    Box,
    Stat,
    StatLabel,
    StatNumber,
    Text,
    Tooltip,
} from '@chakra-ui/react';
import {
    Country,
    formatPrice,
    formatReleaseDate,
    StoreGameData,
    StoreReleaseDateInformation,
} from '@game-watch/shared';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';

import { InfoSourceWrapper } from './InfoSourceWrapper';

export const ReleaseDate: React.FC<{
    releaseDate?: StoreReleaseDateInformation;
    isEarlyAccess?: boolean;
}> = ({ releaseDate, isEarlyAccess }) => {
    const formattedDate = useMemo(
        () => {
            const formattedDate = formatReleaseDate(releaseDate);
            if (
                !isEarlyAccess
                // If we have no comparable date information, just return that
                || !releaseDate
            ) {
                return formattedDate;
            }

            if (
                !releaseDate.isExact
                || dayjs(releaseDate.date).isAfter(new Date())
            ) {
                return (
                    <Box position="relative" width="fit-content">
                        {formattedDate}
                        <Tooltip placement='top' label="Early Access">
                            <Text position="absolute" fontSize="0.6rem" top="0" right="-1.3rem">(EA)</Text>
                        </Tooltip>
                    </Box>
                );
            }

            return 'In Early Access';
        },
        [releaseDate, isEarlyAccess]
    );

    return (
        <Stat>
            <StatLabel>Release Date</StatLabel>
            <StatNumber fontSize="1rem">{formattedDate}</StatNumber>
        </Stat>
    );
};

export const Price: React.FC<{
    price?: number,
    initial?: number,
    country: Country
}> = ({ price, initial, country }) => {
    const hasDiscount = useMemo(
        () => price && initial && price !== initial,
        [price, initial]
    );
    const parsedPrice = useMemo(() => formatPrice({ price, country }), [price, country]);
    const parsedInitial = useMemo(
        () => formatPrice({ price: initial, country }),
        [initial, country]
    );

    return (
        <Stat>
            <StatLabel>Price</StatLabel>
            <StatNumber fontSize="1rem">
                <>
                    {hasDiscount ? <Text as="s">{parsedInitial}</Text> : null} {parsedPrice}
                </>
            </StatNumber>
        </Stat>
    );
};

export const StoreInfoSource: React.FC<{
    data: StoreGameData,
    country: Country
}> = ({ data, country }) => (
    <InfoSourceWrapper>
        <Box flex="1">
            <ReleaseDate releaseDate={data.releaseDate} isEarlyAccess={data.isEarlyAccess} />
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
