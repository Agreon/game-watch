import { AxiosResponse } from "axios";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { http } from "../util/http";

export enum InfoSourceType {
    Steam = "steam",
    Nintendo = "nintendo",
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

export interface GameCtx {
    games: Game[]
    gamesLoading: boolean
    addGame: (name: string) => Promise<void>
    syncGame: (id: string) => Promise<void>
    changeGameName: (game: Game, name: string) => Promise<void>
    deleteGame: (id: string) => Promise<void>
    setGameInfoSource: (game: Game, infoSource: InfoSource) => void
    addTagToGame: (game: Game, tag: Tag) => Promise<void>
    removeTagFromGame: (game: Game, tag: Tag) => Promise<void>
}

export const GameContext = React.createContext<GameCtx>({
    games: [],
    gamesLoading: false,
    addGame: async () => { },
    changeGameName: async () => { },
    syncGame: async () => { },
    deleteGame: async () => { },
    setGameInfoSource: () => { },
    addTagToGame: async () => { },
    removeTagFromGame: async () => { },
});

export function useGameContext() {
    return useContext<GameCtx>(GameContext);
}

const replaceGame = (replacement: Game) => (games: Game[]) =>
    games.map(game => game.id === replacement.id ? replacement : game);

export const GameProvider: React.FC = ({ children }) => {
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

    const addGame = useCallback(async (name: string) => {
        const { data } = await http.post<unknown, AxiosResponse<Game>>("/game", { search: name });

        setGames(games => [
            data,
            ...games,
        ])
    }, []);

    const syncGame = useCallback(async (gameId: string) => {
        const { data } = await http.post<Game>(`/game/${gameId}/sync`);

        setGames(games => [
            data,
            ...games.filter(({ id }) => id !== gameId),
        ])
    }, []);

    const changeGameName = useCallback(async (game: Game, name: string) => {
        const oldGameName = game.name;
        try {
            // Optimistic update
            game.name = name;
            setGames(replaceGame(game));

            await http.put<Game>(`/game/${game.id}`, {
                ...game,
                name
            });
        }
        catch (e) {
            // TODO: Show error toast
            game.name = oldGameName;
            setGames(replaceGame(game));
        }
    }, []);

    const deleteGame = useCallback(async (gameId: string) => {
        await http.delete(`/game/${gameId}`);

        setGames(games => games.filter(({ id }) => id !== gameId))
    }, []);

    const setGameInfoSource = useCallback((game: Game, infoSource: InfoSource) => {
        game.infoSources = [
            infoSource,
            ...game.infoSources.filter(({ id }) => id !== infoSource.id),
        ];
        setGames(replaceGame(game));
    }, []);

    const addTagToGame = useCallback(async (game: Game, tag: Tag) => {
        const oldGameTags = [...game.tags];
        try {
            // Optimistic update
            game.tags = [...game.tags, tag];
            setGames(replaceGame(game));

            await http.post(`/game/${game.id}/tag/${tag.id}`);
        } catch (error) {
            // TODO: Show error toast
            game.tags = oldGameTags;
            setGames(replaceGame(game));
        }
    }, []);

    const removeTagFromGame = useCallback(async (game: Game, tag: Tag) => {
        const oldGameTags = [...game.tags];
        try {
            // Optimistic update
            game.tags = game.tags.filter(({ id }) => id !== tag.id);
            setGames(replaceGame(game));

            await http.delete(`/game/${game.id}/tag/${tag.id}`);
        } catch (error) {
            // TODO: Show error toast
            game.tags = oldGameTags;
            setGames(replaceGame(game));
        }
    }, []);

    useEffect(() => { fetchGames() }, [fetchGames]);

    const contextValue = useMemo(() => ({
        games,
        gamesLoading,
        addGame,
        changeGameName,
        syncGame,
        deleteGame,
        setGameInfoSource,
        addTagToGame,
        removeTagFromGame,
    }), [games, gamesLoading, addGame, changeGameName, syncGame, deleteGame, setGameInfoSource, addTagToGame, removeTagFromGame]);

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    )
}