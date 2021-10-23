import React, { useCallback, useContext, useMemo } from "react";
import { Game, InfoSource, InfoSourceType, Tag, useGamesContext } from "./GamesProvider";
import { useHttp } from "../util/useHttp";
import { AxiosResponse } from "axios";

export interface GameCtx {
    game: Game
    tags: Tag[]
    infoSources: InfoSource[]
    syncGame: () => Promise<void>
    changeGameName: (name: string) => Promise<void>
    deleteGame: () => Promise<void>
    setGameInfoSource: (infoSource: InfoSource) => void
    addTagToGame: (tag: Tag) => Promise<void>
    removeTagFromGame: (tag: Tag) => Promise<void>
    addInfoSource: (type: InfoSourceType, remoteGameId: string) => Promise<InfoSource | undefined>
}

export const GameContext = React.createContext<GameCtx>({
    game: {} as Game,
    tags: [],
    infoSources: [],
    syncGame: async () => { },
    changeGameName: async () => { },
    deleteGame: async () => { },
    setGameInfoSource: () => { },
    addTagToGame: async () => { },
    removeTagFromGame: async () => { },
    addInfoSource: async () => ({} as InfoSource),
});

export function useGameContext() {
    return useContext<GameCtx>(GameContext);
}

export const GameProvider: React.FC<{ game: Game }> = ({ children, game }) => {
    const { setGame, removeGame } = useGamesContext();
    const { withRequest, handleError } = useHttp();

    const syncGame = useCallback(async () => {
        await withRequest(async http => {
            const { data } = await http.post<Game>(`/game/${game.id}/sync`);
            setGame(data.id, data);
        });
    }, [withRequest, setGame, game.id]);

    const changeGameName = useCallback(async (name: string) => {
        // Optimistic update
        const oldGameName = game.name;
        setGame(game.id, curr => ({
            ...curr,
            name
        }));

        await withRequest(
            async http => await http.put<Game>(`/game/${game.id}`, {
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
        await withRequest(async http => {
            await http.delete(`/game/${game.id}`);
            removeGame(game.id);
        });
    }, [withRequest, removeGame, game.id]);

    const setGameInfoSource = useCallback((infoSource: InfoSource) => {
        setGame(game.id, curr => {
            curr.infoSources = [
                infoSource,
                ...curr.infoSources.filter(({ id }) => id !== infoSource.id),
            ];
            return curr;
        });
    }, [setGame, game.id]);

    const addTagToGame = useCallback(async (tag: Tag) => {
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

    const removeTagFromGame = useCallback(async (tag: Tag) => {
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

    // Move to game context
    const addInfoSource = useCallback(async (type: InfoSourceType, remoteGameId: string) => {
        return await withRequest(async http => {
            const { data: infoSource } = await http.post<unknown, AxiosResponse<InfoSource>>(`/info-source`, {
                gameId: game.id,
                type,
                remoteGameId
            });

            setGameInfoSource(infoSource);

            return infoSource;
        });
    }, [withRequest, setGameInfoSource, game.id]);

    const tags = useMemo(() => game.tags, [game.tags]);
    const infoSources = useMemo(() => game.infoSources, [game.infoSources]);

    const contextValue = useMemo(() => ({
        game,
        tags,
        infoSources,
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
        infoSources,
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