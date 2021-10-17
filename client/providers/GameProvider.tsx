import React, { useCallback, useContext, useMemo } from "react";
import { http } from "../util/http";
import { Game, InfoSource, Tag, useGamesContext } from "./GamesProvider";

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

    const syncGame = useCallback(async () => {
        const { data } = await http.post<Game>(`/game/${game.id}/sync`);

        setGame(data);
    }, [setGame, game]);

    const changeGameName = useCallback(async (name: string) => {
        const oldGameName = game.name;
        try {
            // Optimistic update
            game.name = name;
            setGame(game);

            await http.put<Game>(`/game/${game.id}`, {
                ...game,
                name
            });
        }
        catch (e) {
            // TODO: Show error toast
            game.name = oldGameName;
            setGame(game);
        }
    }, [setGame, game]);

    const deleteGame = useCallback(async () => {
        await http.delete(`/game/${game.id}`);

        removeGame(game.id);
    }, [removeGame, game]);

    const setGameInfoSource = useCallback((infoSource: InfoSource) => {
        game.infoSources = [
            infoSource,
            ...game.infoSources.filter(({ id }) => id !== infoSource.id),
        ];
        setGame(game);
    }, [setGame, game]);

    const addTagToGame = useCallback(async (tag: Tag) => {
        const oldGameTags = [...game.tags];
        try {
            // Optimistic update
            game.tags = [...game.tags, tag];
            setGame(game);

            await http.post(`/game/${game.id}/tag/${tag.id}`);
        } catch (error) {
            console.error(error);
            // TODO: Show error toast
            game.tags = oldGameTags;
            setGame(game);
        }
    }, [setGame, game]);

    const removeTagFromGame = useCallback(async (tag: Tag) => {
        const oldGameTags = [...game.tags];
        try {
            // Optimistic update
            game.tags = game.tags.filter(({ id }) => id !== tag.id);
            setGame(game);

            await http.delete(`/game/${game.id}/tag/${tag.id}`);
        } catch (error) {
            // TODO: Show error toast
            game.tags = oldGameTags;
            setGame(game);
        }
    }, [setGame, game]);

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