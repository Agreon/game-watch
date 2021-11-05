import { AxiosResponse } from "axios";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useHttp } from "../util/useHttp";

export enum InfoSourceType {
    Steam = "steam",
    Switch = "switch",
    PsStore = "psStore",
    Epic = "epic",
    Metacritic = "metacritic"
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
    justAdded?: boolean;
}

export interface GamesFilter {
    tags: Tag[]
    infoSources: InfoSourceType[]
}

export interface GamesCtx {
    games: Game[]
    gamesLoading: boolean
    addGame: (name: string) => Promise<void>
    setGame: (id: string, cb: ((current: Game) => Game) | Game) => void
    removeGame: (id: string) => void
    filter: GamesFilter,
    setFilter: React.Dispatch<React.SetStateAction<GamesFilter>>
}

export const GamesContext = React.createContext<GamesCtx | null>(null);

export function useGamesContext() {
    const context = useContext(GamesContext);
    if (!context) {
        throw new Error("GamesContext must be used inside GamesProvider");
    }
    return context;
}

export const GamesProvider: React.FC = ({ children }) => {
    const [gamesLoading, setGamesLoading] = useState(false);
    const [games, setGames] = useState<Game[]>([]);
    const [filter, setFilter] = useState<GamesFilter>({ tags: [], infoSources: [] });
    const { withRequest } = useHttp();

    const fetchGames = useCallback(async () => {
        setGamesLoading(true);
        await withRequest(async http => {
            const { data } = await http.get<Game[]>('/game', {
                params: {
                    withTags: filter.tags.map(tag => tag.id),
                    withInfoSources: filter.infoSources
                }
            });
            setGames(data);
        });
        setGamesLoading(false);
    }, [withRequest, filter]);

    const setGame = useCallback((id: string, cb: ((current: Game) => Game) | Game) => {
        setGames(currentGames => {
            const currentGame = currentGames.find(game => id === game.id)!;
            const newGame = typeof cb === "function" ? cb(currentGame) : cb;
            return currentGames.map(game => game.id === newGame.id ? newGame : game);
        });
    }, []);

    const removeGame = useCallback((gameId: string) => {
        setGames(currentGames => currentGames.filter(({ id }) => id !== gameId))
    }, []);

    const addGame = useCallback(async (name: string) => {
        await withRequest(async http => {
            const { data } = await http.post<unknown, AxiosResponse<Game>>("/game", { search: name });
            setGames(currentGames => [{
                ...data,
                justAdded: true
            },
            ...currentGames
            ]);
        });
    }, [withRequest, setGames]);

    useEffect(() => { fetchGames() }, [fetchGames]);

    const contextValue = useMemo(() => ({
        games,
        gamesLoading,
        addGame,
        setGame,
        removeGame,
        filter,
        setFilter
    }), [games, gamesLoading, addGame, setGame, removeGame, filter, setFilter]);

    return (
        <GamesContext.Provider value={contextValue}>
            {children}
        </GamesContext.Provider>
    )
}