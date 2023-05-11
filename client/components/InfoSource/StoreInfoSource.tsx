import {
    Box,
    Stat,
    StatLabel,
    StatNumber,
    Text,
} from '@chakra-ui/react';
import {
    Country,
    formatPrice,
    formatReleaseDate,
    StoreGameData,
    StoreReleaseDateInformation,
} from '@game-watch/shared';
import React, { useMemo } from 'react';

import { InfoSourceWrapper } from './InfoSourceWrapper';

export const ReleaseDate: React.FC<{
    releaseDate?: StoreReleaseDateInformation;
}> = ({ releaseDate }) => {
    const formattedDate = useMemo(
        () => formatReleaseDate(releaseDate),
        [releaseDate]
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
            <ReleaseDate releaseDate={data.releaseDate} />
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
