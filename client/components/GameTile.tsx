/* eslint-disable @next/next/no-img-element */
import { Button } from "@chakra-ui/button";
import { Box, Flex } from "@chakra-ui/layout";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Game, InfoSource as Source, useGameContext } from "../providers/GameProvider";
import { Skeleton, Text, SkeletonText } from "@chakra-ui/react";
// TODO: RM
import styles from '../styles/Home.module.css'
import { InfoSource } from "./InfoSource";
import { GameTileMenu } from "./GameTile/GameTileMenu";
import { LoadingSpinner } from "./LoadingSpinner";

// TODO: Let users select the priority / image
const INFO_SOURCE_PRIORITY = [
    "psStore",
    "steam",
    "nintendo",
]

const retrieveDataFromInfoSources = (infoSources: Source[], key: string): string | null => {
    for (const sourceType of INFO_SOURCE_PRIORITY) {
        const matchingSource = infoSources.find(source => source.type === sourceType && !source.disabled);
        if (matchingSource && matchingSource.data[key]) {

            if (key === "thumbnailUrl") {
                const thumbnailUrl = matchingSource.data[key] as string;

                if (matchingSource.type === "nintendo") {
                    return thumbnailUrl
                        .replace(/w_(\d*)/, "w_460")
                        .replace(/h_(\d*)/, "h_215")
                }

                if (matchingSource.type === "psStore") {
                    const url = new URL(thumbnailUrl);
                    url.searchParams.delete("w");
                    url.searchParams.append("w", "460");
                    return url.toString();
                }
            }

            return matchingSource.data[key] as string;
        }
    }

    return null;
}

/**
 * TODO:
 * - Stretch the image to full width
 * - Toasts for errors
 */
export const GameTile: React.FC<{ game: Game }> = ({ game }) => {
    const { syncGame, deleteGame } = useGameContext();

    const [loading, setLoading] = useState(false);

    const onSync = useCallback(async () => {
        setLoading(true);
        await syncGame(game.id);
        setLoading(false);
    }, [game, syncGame])


    const onDelete = useCallback(async () => {
        setLoading(true);
        await deleteGame(game.id);
        setLoading(false);
    }, [game, deleteGame]);

    // Needed so that the effect props are evaluated correct.
    const infoSourceLength = useMemo(() => game.infoSources.length, [game]);
    useEffect(() => {
        (async () => {
            if (!infoSourceLength) {
                await onSync();
            }
        })();
        // We only want to call the effect then
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [infoSourceLength]);

    const { fullName, thumbnail } = useMemo(() => ({
        fullName: retrieveDataFromInfoSources(game.infoSources, "fullName"),
        thumbnail: retrieveDataFromInfoSources(game.infoSources, "thumbnailUrl"),
    }), [game.infoSources])

    return (
        <Box key={game.id} className={styles.card} height="100%" position="relative" minWidth="510px" style={{ maxWidth: "510px" }}>
            {loading && <LoadingSpinner />}
            {infoSourceLength > 0 &&
                <Box position="absolute" right="1rem" top="1rem">
                <GameTileMenu onSync={onSync} onDelete={onDelete} gameName={fullName ?? game.name} />
                </Box>
            }
            <Flex padding="1rem" flexDirection="column">
                <Skeleton isLoaded={infoSourceLength > 0}>
                    <Flex justifyContent="center" minHeight="215px" >
                        {thumbnail &&
                            <img
                                alt="thumbnail"
                                src={thumbnail}
                                width="460"
                                style={{ objectFit: "contain", height: "215px" }}
                            />
                        }
                    </Flex>
                </Skeleton>
                <Text fontSize="2xl" mt="1rem">{fullName ?? game.name}</Text>
                <Box>
                    <SkeletonText isLoaded={infoSourceLength > 0}>
                        {game.infoSources
                            .filter(source => !source.disabled)
                            .map(source => <InfoSource key={source.id} game={game} source={source} />)
                        }
                    </SkeletonText>
                </Box>
                <Flex justifyContent="center">
                    <Button>
                        +
                    </Button>
                </Flex>
            </Flex>
        </Box>
    )
}