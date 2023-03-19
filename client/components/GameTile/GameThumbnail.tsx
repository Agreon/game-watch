import { Box, Flex, Skeleton } from '@chakra-ui/react';
import Image, { ImageLoaderProps } from 'next/image';
import React, { useEffect, useState } from 'react';

import { useGameContext } from '../../providers/GameProvider';
import { LoadingSpinner } from '../LoadingSpinner';

// Just use the original cdn servers and not ours in between.
const loader = ({ src }: ImageLoaderProps) => src;

export const GameThumbnail: React.FC = () => {
    const { loading, game, thumbnailUrl } = useGameContext();

    const [imageLoading, setImageLoading] = useState(false);
    useEffect(() => { setImageLoading(true); }, []);

    if (!loading && !game.syncing && !thumbnailUrl) {
        return null;
    }

    const showLoadingSpinner = (loading || game.syncing || (thumbnailUrl !== null && imageLoading));

    return (
        <Box position="relative">
            {showLoadingSpinner && <LoadingSpinner size="xl" />}
            <Skeleton isLoaded={!showLoadingSpinner} >
                <Flex
                    position="relative"
                    justify="center"
                    height="215px"
                    bg={'gray.900'}
                >
                    {thumbnailUrl &&
                        <Image
                            src={thumbnailUrl}
                            unoptimized={true}
                            fill={true}
                            alt={game.name ?? ''}
                            loader={loader}
                            onError={() => setImageLoading(false)}
                            onLoad={() => setImageLoading(false)}
                        />
                    }
                </Flex>
            </Skeleton>
        </Box>
    );
};
