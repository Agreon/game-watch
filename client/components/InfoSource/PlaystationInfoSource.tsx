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
    PlaystationGameData,
} from '@game-watch/shared';
import Image from 'next/image';
import React, { useMemo } from 'react';

import psPlusLogo from '../../assets/ps-plus.svg';
import { InfoSourceWrapper } from './InfoSourceWrapper';
import { ReleaseDate } from './StoreInfoSource';

export const Price: React.FC<{
    price?: number,
    initial?: number,
    freeForPsPlus?: boolean,
    country: Country
}> = ({ price, initial, freeForPsPlus, country }) => {
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
            <StatNumber fontSize="1rem" position="relative" width="fit-content">
                <>
                    {hasDiscount ? <Text as="s">{parsedInitial}</Text> : null} {parsedPrice}
                </>
                {freeForPsPlus
                    ? <Tooltip placement='top' label="Free for PS Plus">
                        <Box position="absolute" top="-0.8rem" right="-1.4rem">
                            <Image
                                alt="ps-plus-icon"
                                priority={true}
                                src={psPlusLogo}
                                quality={100}
                                width={25}
                                height={25}
                            />
                        </Box>
                    </Tooltip>
                    : null
                }
            </StatNumber>
        </Stat>
    );
};

export const PlaystationInfoSource: React.FC<{
    data: PlaystationGameData,
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
                freeForPsPlus={data.freeForPsPlus}
                country={country}
            />
        </Box>
    </InfoSourceWrapper>
);
