import { AxiosResponse } from "axios";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { http } from "../util/http";

export enum InfoSourceType {
    Steam = "steam",
    Switch = "switch",
    PsStore = "psStore",
}

export interface Tag {
    id: string;
    name: string;
    color: string;
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
    tags: Tag[]
    syncing: boolean;
    updatedAt: string;
}

export interface GamesCtx {
    games: Game[]
    gamesLoading: boolean
    addGame: (name: string) => Promise<void>
    setGame: (game: Game) => void
    removeGame: (id: string) => void
}

export const GamesContext = React.createContext<GamesCtx>({
    games: [],
    gamesLoading: false,
    addGame: async () => { },
    setGame: async () => { },
    removeGame: async () => { }
});

export function useGamesContext() {
    return useContext<GamesCtx>(GamesContext);
}

export const GamesProvider: React.FC = ({ children }) => {
    const [gamesLoading, setGamesLoading] = useState(false);
    const [games, setGames] = useState<Game[]>([]);

    const fetchGames = useCallback(async () => {
        setGamesLoading(true);
        try {
            const { data } = await http.get<Game[]>('/game');
            setGames(data);
        } finally {
            setGamesLoading(false);
        }
    }, []);

    const setGame = useCallback((newGame: Game) => {
        setGames(curr => {
            const foundGame = curr.find(({ id }) => id === newGame.id);
            if (!foundGame) {
                return [newGame, ...curr];
            }

            return curr.map(game => game.id === newGame.id ? newGame : game);
        });
    }, []);

    const removeGame = useCallback((gameId: string) => {
        setGames(games => games.filter(({ id }) => id !== gameId))
    }, []);

    const addGame = useCallback(async (name: string) => {
        const { data } = await http.post<unknown, AxiosResponse<Game>>("/game", { search: name });

        setGame(data);
    }, [setGame]);

    useEffect(() => { fetchGames() }, [fetchGames]);

    const contextValue = useMemo(() => ({
        games,
        gamesLoading,
        addGame,
        setGame,
        removeGame
    }), [games, gamesLoading, addGame, setGame, removeGame]);

    return (
        <GamesContext.Provider value={contextValue}>
            {children}
        </GamesContext.Provider>
    )
}