import { AxiosResponse } from "axios";
import { CreateGameDto, GameDto, InfoSourceType, TagDto } from "@game-watch/shared";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useHttp } from "../util/useHttp";
import { useUserContext } from "./UserProvider";

export interface GamesFilter {
    tags: TagDto[]
    infoSources: InfoSourceType[]
}

export interface GamesCtx {
    games: GameDto[]
    gamesLoading: boolean
    addGame: (search: string) => Promise<GameDto | Error>
    setGame: (id: string, cb: ((current: GameDto) => GameDto) | GameDto) => void
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
    const { user } = useUserContext()
    const [gamesLoading, setGamesLoading] = useState(false);
    const [games, setGames] = useState<GameDto[]>([]);
    const [filter, setFilter] = useState<GamesFilter>({ tags: [], infoSources: [] });
    const { withRequest } = useHttp();

    const fetchGames = useCallback(async () => {
        setGamesLoading(true);
        await withRequest(async http => {
            const { data } = await http.get<GameDto[]>('/game', {
                params: {
                    withTags: filter.tags.map(tag => tag.id),
                    withInfoSources: filter.infoSources
                }
            });
            setGames(data);
        });
        setGamesLoading(false);
    }, [withRequest, filter]);

    const setGame = useCallback((id: string, cb: ((current: GameDto) => GameDto) | GameDto) => {
        setGames(currentGames => {
            const currentGame = currentGames.find(game => id === game.id)!;
            const newGame = typeof cb === "function" ? cb(currentGame) : cb;
            return currentGames.map(game => game.id === newGame.id ? newGame : game);
        });
    }, []);

    const removeGame = useCallback((gameId: string) => {
        setGames(currentGames => currentGames.filter(({ id }) => id !== gameId))
    }, []);

    const addGame = useCallback(async (search: string) => {
        return await withRequest(async http => {
            const { data } = await http.post<CreateGameDto, AxiosResponse<GameDto>>("/game", { search });
            setGames(currentGames => [
                data,
                ...currentGames
            ]);

            return data;
        });
    }, [withRequest, setGames]);

    useEffect(() => { fetchGames() }, [fetchGames, user.id]);

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