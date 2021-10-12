import React, { useCallback, useContext, useMemo, useState } from "react";
import { http } from "../util/http";

export enum InfoSourceType {
    Steam = "steam",
    Nintendo = "nintendo",
    PsStore = "psStore",
}

// TOOD: We need a monorepo
export interface InfoSource {
    id: string
    type: InfoSourceType
    disabled: boolean
    resolveError: boolean
    data: Record<string, any> | null
    loading: boolean
}

export interface Game {
    id: string
    search: string
    name: string | null
    infoSources: InfoSource[]
    syncing: boolean;
    updatedAt: string;
}

export interface GameCtx {
    games: Game[]
    addGame: (name: string) => Promise<void>
    syncGame: (id: string) => Promise<void>
    changeGameName: (game: Game, name: string) => Promise<void>
    deleteGame: (id: string) => Promise<void>
    setGameInfoSource: (game: Game, infoSource: InfoSource) => void
}

export const GameContext = React.createContext<GameCtx>({
    games: [],
    addGame: async () => { },
    changeGameName: async () => { },
    syncGame: async () => { },
    deleteGame: async () => { },
    setGameInfoSource: () => { }
});

export function useGameContext() {
    const context = useContext(GameContext);

    return context as GameCtx;
}

export const GameProvider: React.FC<{ initialGames: Game[] }> = ({ children, initialGames }) => {
    const [games, setGames] = useState(initialGames);

    const addGame = useCallback(async (name: string) => {
        const { data } = await http.post<any>("/game", { search: name });

        setGames(games => [
            data,
            ...games,
        ])
    }, [setGames]);

    const syncGame = useCallback(async (gameId: string) => {
        const { data } = await http.post<Game>(`/game/${gameId}/sync`);

        setGames(games => [
            data,
            ...games.filter(({ id }) => id !== gameId),
        ])
    }, [setGames]);

    const changeGameName = useCallback(async (game: Game, name: string) => {
        try {
            const { data } = await http.put<Game>(`/game/${game.id}`, {
                ...game,
                name
            });

            setGames(games => [
                data,
                ...games.filter(({ id }) => id !== game.id),
            ]);
        }
        catch (e) {
            // TODO: show error toast
            console.error(e);
        }
    }, [setGames]);

    const deleteGame = useCallback(async (gameId: string) => {
        await http.delete(`/game/${gameId}`);

        setGames(games => games.filter(({ id }) => id !== gameId))
    }, [setGames]);

    const setGameInfoSource = useCallback((game: Game, infoSource: InfoSource) => {
        game.infoSources = [
            infoSource,
            ...game.infoSources.filter(({ id }) => id !== infoSource.id),
        ];
        setGames(games => [
            game,
            ...games.filter(({ id }) => id !== game.id),
        ])
    }, [setGames]);

    const contextValue = useMemo(() => ({
        games,
        addGame,
        changeGameName,
        syncGame,
        deleteGame,
        setGameInfoSource
    }), [games, addGame, changeGameName, syncGame, deleteGame, setGameInfoSource]);

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    )
}