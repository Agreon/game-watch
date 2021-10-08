import axios from "axios";
import React, { useCallback, useContext, useMemo, useState } from "react";

export interface InfoSource {
    id: string
    type: string
    data: Record<string, unknown>
}

// TOOD: We need a monorepo
export interface Game {
    id: string
    name: string
    infoSources: InfoSource[]
    syncing: boolean;
}

export interface GameCtx {
    games: Game[]
    addGame: (name: string) => Promise<Game>
    syncGame: (id: string) => Promise<Game>
}

export const GameContext = React.createContext<GameCtx>({
    games: [],
    addGame: async () => ({} as Game),
    syncGame: async () => ({} as Game),
});

export function useGameContext() {
    const context = useContext(GameContext);

    return context as GameCtx;
}

export const GameProvider: React.FC<{ initialGames: Game[] }> = ({ children, initialGames }) => {
    const [games, setGames] = useState(initialGames);

    // TODO: Won't work that way
    const setGameLoading = useCallback((gameId: string, state: boolean) => {
        console.log(gameId);
        const game = games.find(({ id }) => id === gameId);
        game!.syncing = state;

        setGames([
            game!,
            ...games.filter(game => game.id !== gameId),
        ]);
    }, [games]);

    const syncGame = useCallback(async (gameId: string) => {
        try {
            setGameLoading(gameId, true);

            const { data } = await axios.post<any>(`http://localhost:3002/game/${gameId}/sync`);

            setGames([
                data!,
                ...games.filter(game => game.id !== gameId),
            ]);

            return data;
        } catch (e) {
            console.error(e);
        } finally {
            // TODO: Will override sync?
            setGameLoading(gameId, false);
        }
    }, [games, setGames, setGameLoading])

    const addGame = useCallback(async (name: string) => {
        try {
            const { data } = await axios.post<any>("http://localhost:3002/game", { search: name });

            setGames([{ ...data }, ...games]);

            return data;
        } catch (e) {
            console.error(e);
        }
    }, [games, setGames])


    const contextValue = useMemo(() => ({
        games,
        addGame,
        syncGame
    }), [games, addGame, syncGame]);

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    )
}