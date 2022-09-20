import {
    Box,
    Stat,
    StatLabel,
    StatNumber,
    Text,
} from '@chakra-ui/react';
import { Country, formatPrice, formatReleaseDate, StoreGameData } from '@game-watch/shared';
import React, { useMemo } from 'react';

import { useUserContext } from '../../providers/UserProvider';
import { InfoSourceWrapper } from './InfoSourceWrapper';

const ReleaseDate: React.FC<{
    releaseDate?: Date;
    originalDate?: string
}> = ({ releaseDate, originalDate }) => {
    const formattedDate = useMemo(
        () => formatReleaseDate({ releaseDate, originalDate }),
        [releaseDate, originalDate]
    );

    return (
        <Stat>
            <StatLabel>Release Date</StatLabel>
            <StatNumber fontSize="1rem">{formattedDate}</StatNumber>
        </Stat>
    );
};

const Price: React.FC<{
    price?: number,
    initial?: number,
    userCountry: Country
}> = ({ price, initial, userCountry }) => {
    const hasDiscount = useMemo(
        () => price && initial && price !== initial,
        [price, initial]
    );
    const parsedPrice = useMemo(
        () => formatPrice({ price, country: userCountry }),
        [price, userCountry]
    );
    const parsedInitial = useMemo(
        () => formatPrice({ price: initial, country: userCountry }),
        [initial, userCountry]
    );

    return (
        <Stat>
            <StatLabel>Price</StatLabel>
            <StatNumber fontSize="1rem">
                {hasDiscount ? <Text as="s">{parsedInitial}</Text> : null} {parsedPrice}
            </StatNumber>
        </Stat>
    );
};

export const StoreInfoSource: React.FC<{ data: StoreGameData }> = ({ data }) => {
    const { user } = useUserContext();

    return (
        <InfoSourceWrapper>
            <Box flex="1">
                <ReleaseDate
                    releaseDate={data.releaseDate}
                    originalDate={data.originalReleaseDate}
                />
            </Box>
            <Box flex="1">
                <Price
                    price={data.priceInformation?.final}
                    initial={data.priceInformation?.initial}
                    userCountry={user.country}
                />
            </Box>
        </InfoSourceWrapper>
    );
};
