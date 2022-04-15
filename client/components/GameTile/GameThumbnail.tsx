import { Box, Flex } from "@chakra-ui/layout";
import { Skeleton, useColorModeValue } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

import { useGameContext } from "../../providers/GameProvider";
import { LoadingSpinner } from "../LoadingSpinner";

export const GameThumbnail: React.FC = () => {
    const { loading, game, thumbnailUrl } = useGameContext();

    const [imageLoading, setImageLoading] = useState(false);
    useEffect(() => { setImageLoading(true); }, []);

    return (
        <Box position="relative">
            {(loading || game.syncing || (thumbnailUrl !== null && imageLoading)) && <LoadingSpinner size="xl" />}
            <Skeleton isLoaded={thumbnailUrl !== null ? !imageLoading : true}>
                <Flex position="relative" justify="center" height="215px" bg={useColorModeValue("white", "gray.900")} >
                    {thumbnailUrl &&
                        <img
                            width="460"
                            style={{ objectFit: "cover" }}
                        alt=""
                            src={thumbnailUrl}
                            onError={() => setImageLoading(false)}
                            onLoad={() => setImageLoading(false)}
                        />
                    }
                </Flex>
            </Skeleton>
        </Box>
    );
};
