import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { GameWithLoadingState, useGamesContext } from "./GamesProvider";
import { useHttp } from "../util/useHttp";
import { AxiosResponse } from "axios";
import { CreateInfoSourceDto, GameDto, InfoSourceDto, InfoSourceType, StoreGameData, TagDto } from "game-watch-shared";

// TODO: Uncool
export interface InfoSourceWithLoadingState extends InfoSourceDto {
    loading?: boolean;
}


// TODO: Let users select the priority / image
export const INFO_SOURCE_PRIORITY = [
    InfoSourceType.PsStore,
    InfoSourceType.Steam,
    InfoSourceType.Switch,
    InfoSourceType.Epic,
    InfoSourceType.Metacritic,
];

const retrieveDataFromInfoSources = (infoSources: InfoSourceDto[], key: string): string | null => {
    for (const infoSource of infoSources) {
        if (!infoSource.data) {
            continue;
        }
        const valueForKey = (infoSource.data as any)[key] as string | undefined;

        if (valueForKey) {
            if (infoSource.type === "psStore" && key === "thumbnailUrl") {
                const url = new URL(valueForKey);
                url.searchParams.delete("w");
                url.searchParams.append("w", "460");
                return url.toString();
            }

            if (infoSource.type === "epic" && key === "thumbnailUrl") {
                const url = new URL(valueForKey);
                url.searchParams.delete("h");
                url.searchParams.append("h", "215");
                return url.toString();
            }

            return valueForKey;
        }
    }

    return null;
}

export interface GameCtx {
    game: GameDto
    tags: TagDto[]
    loading: boolean
    allInfoSources: InfoSourceDto[]
    activeInfoSources: InfoSourceDto[]
    fullName: string
    thumbnailUrl: string | null
    syncGame: () => Promise<void>
    changeGameName: (name: string) => Promise<void>
    deleteGame: () => Promise<void>
    setGameInfoSource: (infoSource: InfoSourceDto) => void
    addTagToGame: (tag: TagDto) => Promise<void>
    removeTagFromGame: (tag: TagDto) => Promise<void>
    addInfoSource: (type: InfoSourceType, url: string) => Promise<InfoSourceDto | undefined>
}

export const GameContext = React.createContext<GameCtx | undefined>(undefined);

export function useGameContext() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error("GameContext must be used inside GameProvider");
    }
    return context;
}

export const GameProvider: React.FC<{ game: GameWithLoadingState }> = ({ children, game }) => {
    const { setGame, removeGame } = useGamesContext();
    const { withRequest, handleError } = useHttp();
    const [loading, setLoading] = useState(false);

    const syncGame = useCallback(async () => {
        setLoading(true);
        await withRequest(async http => {
            const { data } = await http.post<GameDto>(`/game/${game.id}/sync`);
            setGame(data.id, data);
        });
        setLoading(false);
    }, [withRequest, setGame, game.id]);

    const changeGameName = useCallback(async (name: string) => {
        // Optimistic update
        const oldGameName = game.name;
        setGame(game.id, curr => ({
            ...curr,
            name
        }));

        await withRequest(
            async http => await http.put<GameDto>(`/game/${game.id}`, {
                ...game,
                name
            }),
            (error) => {
                setGame(game.id, curr => ({
                    ...curr,
                    name: oldGameName
                }));
                handleError(error, {
                    description: "Could not change the name. Please try again.",
                });
            }
        );
    }, [withRequest, handleError, setGame, game]);

    const deleteGame = useCallback(async () => {
        setLoading(true);
        await withRequest(async http => {
            await http.delete(`/game/${game.id}`);
            removeGame(game.id);
        });
        setLoading(false);
    }, [withRequest, removeGame, game.id]);

    const setGameInfoSource = useCallback((newInfoSource: InfoSourceDto) => {
        setGame(game.id, curr => {
            curr.infoSources = [...curr.infoSources.filter(({ id }) => newInfoSource.id !== id), newInfoSource];
            return curr;
        });
    }, [setGame, game.id]);

    const addTagToGame = useCallback(async (tag: TagDto) => {
        const oldGameTags = [...game.tags];
        // Optimistic update
        setGame(game.id, curr => ({
            ...curr,
            tags: [...curr.tags, tag]
        }));

        await withRequest(
            async http => await http.post(`/game/${game.id}/tag/${tag.id}`),
            (error) => {
                setGame(game.id, curr => ({
                    ...curr,
                    tags: oldGameTags
                }));
                handleError(error, {
                    description: "Could not add tag. Please try again.",
                });
            }
        );
    }, [withRequest, handleError, setGame, game.id, game.tags]);

    const removeTagFromGame = useCallback(async (tag: TagDto) => {
        const oldGameTags = [...game.tags];
        // Optimistic update
        setGame(game.id, curr => ({
            ...curr,
            tags: curr.tags.filter(({ id }) => id !== tag.id)
        }));

        await withRequest(
            async http => await http.delete(`/game/${game.id}/tag/${tag.id}`),
            (error) => {
                setGame(game.id, curr => ({
                    ...curr,
                    tags: oldGameTags
                }));
                handleError(error, {
                    description: "Could not remove tag. Please try again.",
                });
            }
        );
    }, [withRequest, handleError, setGame, game.id, game.tags]);

    const addInfoSource = useCallback(async (type: InfoSourceType, url: string) => {
        return await withRequest(async http => {
            const { data: infoSource } = await http.post<CreateInfoSourceDto, AxiosResponse<InfoSourceDto>>(`/info-source`, {
                gameId: game.id,
                type,
                url
            });

            setGameInfoSource(infoSource);

            return infoSource;
        });
    }, [withRequest, setGameInfoSource, game.id]);

    const tags = useMemo(() => game.tags, [game.tags]);

    const allInfoSources = useMemo(() => game.infoSources, [game.infoSources]);
    const activeInfoSources = useMemo(
        () => allInfoSources
            .filter(source => !source.disabled)
            .sort((a, b) => {
                const aPriority = INFO_SOURCE_PRIORITY.findIndex(type => type === a.type);
                const bPriority = INFO_SOURCE_PRIORITY.findIndex(type => type === b.type);
                return aPriority - bPriority;
            })
        , [allInfoSources]);

    const thumbnailUrl = useMemo(
        () => retrieveDataFromInfoSources(activeInfoSources, "thumbnailUrl"),
        [activeInfoSources]
    );

    const nameFromInfoSource = useMemo(
        () => retrieveDataFromInfoSources(activeInfoSources, "fullName"),
        [activeInfoSources]
    );
    // Priority: User-defined name, info source name or the initial search
    const fullName = useMemo(
        () => game.name ?? nameFromInfoSource ?? game.search,
        [game.name, nameFromInfoSource, game.search]
    );

    // Initial load
    useEffect(() => {
        (async () => {
            if (game.justAdded) {
                await syncGame();
            }
        })();
        // We only want to call the effect then
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game.justAdded]);


    const contextValue = useMemo(() => ({
        game,
        tags,
        allInfoSources,
        activeInfoSources,
        fullName,
        thumbnailUrl,
        loading,
        syncGame,
        changeGameName,
        deleteGame,
        setGameInfoSource,
        addTagToGame,
        removeTagFromGame,
        addInfoSource
    }), [
        game,
        tags,
        allInfoSources,
        activeInfoSources,
        fullName,
        thumbnailUrl,
        loading,
        syncGame,
        changeGameName,
        deleteGame,
        setGameInfoSource,
        addTagToGame,
        removeTagFromGame,
        addInfoSource
    ]);

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    )
}