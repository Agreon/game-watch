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
    name: string
    infoSources: InfoSource[]
    syncing: boolean;
    updatedAt: string;
}

export interface GameCtx {
    games: Game[]
    addGame: (name: string) => Promise<void>
    syncGame: (id: string) => Promise<void>
    deleteGame: (id: string) => Promise<void>
    setGameInfoSource: (game: Game, infoSource: InfoSource) => void
}

export const GameContext = React.createContext<GameCtx>({
    games: [],
    addGame: async () => { },
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

        setGames([
            data,
            ...games,
        ])
    }, [setGames, games]);

    const syncGame = useCallback(async (gameId: string) => {
        const { data } = await http.post<any>(`/game/${gameId}/sync`);

        setGames([
            data,
            ...games.filter(({ id }) => id !== gameId),
        ])
    }, [setGames, games]);

    const deleteGame = useCallback(async (gameId: string) => {
        await http.delete(`/game/${gameId}`);

        setGames(games.filter(({ id }) => id !== gameId))
    }, [setGames, games]);

    const setGameInfoSource = useCallback((game: Game, infoSource: InfoSource) => {
        game.infoSources = [
            infoSource,
            ...game.infoSources.filter(({ id }) => id !== infoSource.id),
        ];
        setGames([
            game,
            ...games.filter(({ id }) => id !== game.id),
        ])
    }, [setGames, games]);

    const contextValue = useMemo(() => ({
        games,
        addGame,
        syncGame,
        deleteGame,
        setGameInfoSource
    }), [games, addGame, syncGame, deleteGame, setGameInfoSource]);

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    )
}