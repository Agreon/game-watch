import {
    CreateInfoSourceDto,
    GameDto,
    InfoSourceDto,
    InfoSourceState,
    InfoSourceType,
    SetupGameDto,
    TagDto,
} from '@game-watch/shared';
import { AxiosResponse } from 'axios';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { useErrorHandler } from '../util/useErrorHandler';
import { useHttp } from '../util/useHttp';
import { usePolling } from '../util/usePolling';

export const INFO_SOURCE_PRIORITY = [
    InfoSourceType.Playstation,
    InfoSourceType.Steam,
    InfoSourceType.Switch,
    InfoSourceType.Epic,
    InfoSourceType.Metacritic,
    InfoSourceType.Proton
];

const retrieveDataFromInfoSources = (infoSources: InfoSourceDto[], key: string): string | null => {
    for (const infoSource of infoSources) {
        if (!infoSource.data) {
            continue;
        }
        const valueForKey = (infoSource.data as any)[key] as string | undefined;

        if (valueForKey) {
            if (infoSource.type === InfoSourceType.Playstation && key === 'thumbnailUrl') {
                const url = new URL(valueForKey);
                url.searchParams.delete('w');
                url.searchParams.append('w', '460');
                return url.toString();
            }

            if (infoSource.type === InfoSourceType.Epic && key === 'thumbnailUrl') {
                const url = new URL(valueForKey);
                url.searchParams.delete('h');
                url.searchParams.append('h', '215');
                return url.toString();
            }

            return valueForKey;
        }
    }

    return null;
};

export interface GameCtx {
    game: GameDto
    tags: TagDto[]
    loading: boolean
    allInfoSources: InfoSourceDto[]
    activeInfoSources: InfoSourceDto[]
    thumbnailUrl: string | null
    setupGame: (options: SetupGameDto) => Promise<void>
    syncGame: () => Promise<void>
    changeGameName: (name: string) => Promise<void>
    deleteGame: () => Promise<void>
    setGameInfoSource: (infoSource: InfoSourceDto) => void
    updateGameInfoSource: (infoSource: InfoSourceDto) => void
    removeGameInfoSource: (id: string) => void
    addTagToGame: (tag: TagDto) => Promise<void>
    removeTagFromGame: (tag: TagDto) => Promise<void>
    addInfoSource: (params: { type: InfoSourceType, url: string }) => Promise<void | Error>
}

export const GameContext = React.createContext<GameCtx | undefined>(undefined);

export function useGameContext() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('GameContext must be used inside GameProvider');
    }
    return context;
}

export const GameProvider: React.FC<{
    children: React.ReactChild,
    game: GameDto,
    setGame: (id: string, cb: ((current: GameDto) => GameDto) | GameDto) => void
    removeGame: (id: string) => void
}> = ({ children, game, setGame, removeGame }) => {
    const { withRequest, http } = useHttp();
    const handleError = useErrorHandler();
    const [loading, setLoading] = useState(false);

    const syncGame = useCallback(async () => {
        setLoading(true);
        await withRequest(async http => {
            const { data } = await http.post<GameDto>(`/game/${game.id}/sync`);
            setGame(data.id, data);
        });
        setLoading(false);
    }, [withRequest, setGame, game.id]);

    // TODO: Extract polling util for 429-Handling
    // useEffect(() => {
    //     if (!game.syncing) {
    //         return;
    //     }

    //     const intervalId = setInterval(async () => {
    //         await withRequest(async http => {
    //             const { data } = await http.get<GameDto>(`/game/${game.id}`);
    //             setGame(data.id, data);
    //             if (data.syncing === false) {
    //                 clearInterval(intervalId);
    //             }
    //         });
    //     }, 1000);

    //     return () => clearInterval(intervalId);
    // }, [game.id, game.syncing, handleError, setGame, withRequest]);

    const pollGame = useCallback(async () => {
        if (!game.syncing) {
            return true;
        }

        const { data } = await http.get<GameDto>(`/game/${game.id}`);
        setGame(data.id, data);

        return data.syncing === false;
    }, [game.syncing, game.id, http, setGame]);
    usePolling(pollGame, 1000, [game.syncing]);

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
                    description: 'Could not change the name. Please try again.',
                });
            }
        );
    }, [withRequest, handleError, setGame, game]);

    const setupGame = useCallback(async (options: SetupGameDto) => {
        await withRequest(async http => {
            const { data } = await http.post<GameDto>(`/game/${game.id}/setup`, options);
            setGame(data.id, data);
        });
    }, [withRequest, setGame, game.id]);

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
            curr.infoSources = [
                ...curr.infoSources.filter(({ id }) => newInfoSource.id !== id),
                newInfoSource
            ];
            return curr;
        });
    }, [setGame, game.id]);

    const updateGameInfoSource = useCallback((newInfoSource: InfoSourceDto) => {
        setGame(game.id, curr => {
            const filteredInfoSources = curr.infoSources.filter(
                ({ id }) => newInfoSource.id !== id
            );
            // Make sure sources disabled in the mean time are not re-added
            if (filteredInfoSources.length === curr.infoSources.length) {
                return curr;
            }

            curr.infoSources = [...filteredInfoSources, newInfoSource];
            return curr;
        });
    }, [setGame, game.id]);

    const removeGameInfoSource = useCallback((id: string) => {
        setGame(game.id, curr => {
            curr.infoSources = [...curr.infoSources.filter((infoSource) => infoSource.id !== id)];
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
                    description: 'Could not add tag. Please try again.',
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
            error => {
                setGame(game.id, curr => ({
                    ...curr,
                    tags: oldGameTags
                }));
                handleError(error, {
                    description: 'Could not remove tag. Please try again.',
                });
            }
        );
    }, [withRequest, handleError, setGame, game.id, game.tags]);

    const addInfoSource = useCallback(async (params: { type: InfoSourceType, url: string }) => {
        return await withRequest(async http => {
            const { data: infoSource } = await http.post<CreateInfoSourceDto, AxiosResponse<InfoSourceDto>>(`/info-source`, {
                gameId: game.id,
                type: params.type,
                url: params.url
            });

            setGameInfoSource(infoSource);
        }, error => {
            if (error.response?.status === 400) {
                return handleError(error, {
                    description: 'Could not extract the game id. Make sure to pass the complete url.',
                });
            }
            handleError(error);
        });
    }, [withRequest, setGameInfoSource, game.id, handleError]);

    const tags = useMemo(() => game.tags, [game.tags]);

    const allInfoSources = useMemo(
        () => [...game.infoSources].sort((a, b) => {
            const aPriority = INFO_SOURCE_PRIORITY.findIndex(type => type === a.type);
            const bPriority = INFO_SOURCE_PRIORITY.findIndex(type => type === b.type);
            return aPriority - bPriority;
        }),
        [game.infoSources]
    );

    const activeInfoSources = useMemo(
        () => allInfoSources.filter(source => source.state !== InfoSourceState.Disabled),
        [allInfoSources]
    );

    const thumbnailUrl = useMemo(
        () => retrieveDataFromInfoSources(activeInfoSources, 'thumbnailUrl'),
        [activeInfoSources]
    );

    const contextValue = useMemo(() => ({
        game,
        tags,
        allInfoSources,
        activeInfoSources,
        thumbnailUrl,
        loading,
        setupGame,
        syncGame,
        changeGameName,
        deleteGame,
        setGameInfoSource,
        updateGameInfoSource,
        removeGameInfoSource,
        addTagToGame,
        removeTagFromGame,
        addInfoSource
    }), [
        game,
        tags,
        allInfoSources,
        activeInfoSources,
        thumbnailUrl,
        loading,
        setupGame,
        syncGame,
        changeGameName,
        deleteGame,
        setGameInfoSource,
        updateGameInfoSource,
        removeGameInfoSource,
        addTagToGame,
        removeTagFromGame,
        addInfoSource
    ]);

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    );
};
