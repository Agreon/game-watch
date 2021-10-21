import Image from 'next/image';
import { Box, Flex } from "@chakra-ui/layout";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { InfoSource as Source } from "../../providers/GamesProvider";
import { Skeleton, Text, SkeletonText, useColorModeValue } from "@chakra-ui/react";
import { GameTileMenu } from "./GameTileMenu";
import { LoadingSpinner } from "../LoadingSpinner";
import { InfoSourceList } from "../InfoSource/InfoSourceList";
import { GameName } from "./GameName";
import { GameTags } from "../GameTags/GameTags";
import { useGameContext } from "../../providers/GameProvider";

// TODO: Let users select the priority / image
const INFO_SOURCE_PRIORITY = [
    "psStore",
    "steam",
    "switch",
    "metacritic"
]

const retrieveDataFromInfoSources = (infoSources: Source[], key: string): string | null => {
    for (const infoSource of infoSources) {
        if (infoSource.data?.[key]) {
            if (key === "thumbnailUrl" && infoSource.type === "psStore") {
                const url = new URL(infoSource.data[key] as string);
                url.searchParams.delete("w");
                url.searchParams.append("w", "460");
                return url.toString();
            }

            return infoSource.data[key] as string;
        }
    }

    return null;
}

/**
 * TODO: Toasts for errors
 * TODO: If no image is found, loading state is forever, game not deletable
 */
export const GameTileX: React.FC = () => {
    const { game, infoSources, syncGame, deleteGame, changeGameName } = useGameContext();

    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);

    const onSync = useCallback(async () => {
        setLoading(true);
        await syncGame();
        setLoading(false);
    }, [syncGame])

    const onChangeName = useCallback(async (value) => {
        if (value === "") {
            return;
        }
        // No loading state, this is optimistic.
        await changeGameName(value);
    }, [changeGameName])

    const onDelete = useCallback(async () => {
        setLoading(true);
        await deleteGame();
        setLoading(false);
    }, [deleteGame]);

    // Needed so that the effect props are evaluated correct.
    const infoSourceLength = useMemo(() => infoSources.length, [infoSources]);
    useEffect(() => {
        (async () => {
            if (!infoSourceLength) {
                setImageLoading(true);
                await onSync();
            }
        })();
        // We only want to call the effect then
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [infoSourceLength]);

    useEffect(() => { setImageLoading(true) }, []);

    // TODO: Do this on server side
    const sortedInfoSources = useMemo(
        () => infoSources
            .filter(source => !source.disabled)
            .sort((a, b) => {
                const aPriority = INFO_SOURCE_PRIORITY.findIndex(type => type === a.type);
                const bPriority = INFO_SOURCE_PRIORITY.findIndex(type => type === b.type);
                return aPriority - bPriority;
            })
        , [infoSources]);

    const { fullName, thumbnail } = useMemo(() => ({
        fullName: retrieveDataFromInfoSources(sortedInfoSources, "fullName"),
        thumbnail: retrieveDataFromInfoSources(sortedInfoSources, "thumbnailUrl"),
    }), [sortedInfoSources]);

    return (
        <Box
            position="relative"
            marginX={[0, 0, "1rem"]}
            marginY="1rem"
            height="100%"
            minWidth={["100%", "28rem"]}
            maxWidth={["100vw", "28rem"]}
            overflow="hidden"
            bg={useColorModeValue('white', 'gray.800')}
            borderWidth="1px"
            rounded="lg"
            shadow="lg"
            boxShadow="xl"
            _hover={{
                borderColor: useColorModeValue("grey", "white")
            }}
            transition="border-color 0.15s ease"
        >
            <Box position="absolute" right="0" top="0" zIndex="1">
                <GameTileMenu onSync={onSync} onDelete={onDelete} gameName={game.name ?? fullName ?? game.search} />
            </Box>
            <Flex direction="column">
                <Box position="relative">
                    {(loading || (infoSourceLength > 0 && imageLoading)) && <LoadingSpinner size="xl" />}
                    <Skeleton isLoaded={!loading || infoSourceLength > 0}>
                        <Flex position="relative" justify="center" height="215px" bg={useColorModeValue("white", "gray.900")} >
                            {thumbnail &&
                                <Image
                                alt=""
                                priority={true}
                                layout="fill"
                                objectFit="cover"
                                src={thumbnail}
                                onError={() => setImageLoading(false)}
                                onLoad={() => setImageLoading(false)}
                                />
                            }
                        </Flex>
                    </Skeleton>
                </Box>
                <Box padding="1rem">
                    <GameName name={game.name ?? fullName ?? game.search} onChange={onChangeName} />
                    {!loading && <GameTags />}
                    {infoSourceLength === 0 && (
                        <>
                            {loading && <SkeletonText />}
                            {!loading && <Text size="xl" textAlign="center" my="1" >No sources found :C</Text>}
                        </>
                    )}
                    {!loading && <InfoSourceList infoSources={sortedInfoSources} />}
                </Box>
            </Flex>
        </Box>
    )
}

export const GameTile = React.memo(GameTileX);