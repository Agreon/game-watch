import Image from 'next/image';
import { Box, Flex } from "@chakra-ui/layout";
import React, { useEffect, useState } from "react";
import { Skeleton, useColorModeValue } from "@chakra-ui/react";
import { LoadingSpinner } from "../LoadingSpinner";
import { useGameContext } from "../../providers/GameProvider";

export const GameThumbnail: React.FC = () => {
    const { loading, thumbnailUrl } = useGameContext();

    const [imageLoading, setImageLoading] = useState(false);
    useEffect(() => { setImageLoading(true) }, []);

    return (
        <Box position="relative">
            {(loading || (thumbnailUrl !== null && imageLoading)) && <LoadingSpinner size="xl" />}
            <Skeleton isLoaded={!loading && (thumbnailUrl !== null ? !imageLoading : true)}>
                <Flex position="relative" justify="center" height="215px" bg={useColorModeValue("white", "gray.900")} >
                    {thumbnailUrl &&
                        <Image
                            alt=""
                            priority={true}
                            layout="fill"
                            objectFit="cover"
                            src={thumbnailUrl}
                            onError={() => setImageLoading(false)}
                            onLoad={() => setImageLoading(false)}
                        />
                    }
                </Flex>
            </Skeleton>
        </Box>
    )
}