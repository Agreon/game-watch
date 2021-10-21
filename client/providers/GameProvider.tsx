import React, { useCallback, useContext, useMemo } from "react";
import { Game, InfoSource, Tag, useGamesContext } from "./GamesProvider";
import { useHttp } from "../util/useHttp";

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
            setGame(data);
        });
    }, [withRequest, setGame, game]);

    const changeGameName = useCallback(async (name: string) => {
        const oldGameName = game.name;
        // Optimistic update
        game.name = name;
        setGame(game);

        await withRequest(
            async http => await http.put<Game>(`/game/${game.id}`, {
                ...game,
                name
            }),
            (error) => {
                game.name = oldGameName;
                setGame(game);
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
    }, [withRequest, removeGame, game]);

    const setGameInfoSource = useCallback((infoSource: InfoSource) => {
        game.infoSources = [
            infoSource,
            ...game.infoSources.filter(({ id }) => id !== infoSource.id),
        ];
        setGame(game);
    }, [setGame, game]);

    const addTagToGame = useCallback(async (tag: Tag) => {
        const oldGameTags = [...game.tags];
        // Optimistic update
        game.tags = [...game.tags, tag];
        setGame(game);

        await withRequest(
            async http => await http.post(`/game/${game.id}/tag/${tag.id}`),
            (error) => {
                game.tags = oldGameTags;
                setGame(game);
                handleError(error, {
                    description: "Could not add tag. Please try again.",
                });
            }
        );
    }, [withRequest, handleError, setGame, game]);

    const removeTagFromGame = useCallback(async (tag: Tag) => {
        const oldGameTags = [...game.tags];
        // Optimistic update
        game.tags = game.tags.filter(({ id }) => id !== tag.id);
        setGame(game);

        await withRequest(
            async http => await http.delete(`/game/${game.id}/tag/${tag.id}`),
            (error) => {
                game.tags = oldGameTags;
                setGame(game);
                handleError(error, {
                    description: "Could not remove tag. Please try again.",
                });
            }
        );
    }, [withRequest, handleError, setGame, game]);

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
        removeTagFromGame
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
    ]);

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    )
}