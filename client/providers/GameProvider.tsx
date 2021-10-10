import axios from "axios";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { useMap } from "react-use";

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
    addInfoSource: (game: Game, type: InfoSourceType, remoteGameId: string) => Promise<InfoSource>
    syncInfoSource: (game: Game, infoSource: InfoSource) => Promise<void>
    disableInfoSource: (game: Game, infoSource: InfoSource) => Promise<void>
}

export const GameContext = React.createContext<GameCtx>({
    games: [],
    addGame: async () => { },
    syncGame: async () => { },
    deleteGame: async () => { },
    addInfoSource: async () => ({} as InfoSource),
    syncInfoSource: async () => { },
    disableInfoSource: async () => { },
});

export function useGameContext() {
    const context = useContext(GameContext);

    return context as GameCtx;
}

export const GameProvider: React.FC<{ initialGames: Game[] }> = ({ children, initialGames }) => {
    const [gameMap, { set: setGame, remove: removeGame }] = useMap<Record<string, Game>>(
        initialGames.reduce((acc, curr) => {
            acc[curr.id] = curr;
            return acc;
        }, {} as Record<string, Game>)
    );
    const games = useMemo(() => Object.values(gameMap).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()), [gameMap]);

    const addGame = useCallback(async (name: string) => {
        const { data } = await axios.post<any>("http://localhost:3002/game", { search: name });

        setGame(data.id, data);
    }, [setGame]);

    const syncGame = useCallback(async (gameId: string) => {
        const { data } = await axios.post<any>(`http://localhost:3002/game/${gameId}/sync`);

        setGame(data.id, data);
    }, [setGame]);

    const deleteGame = useCallback(async (gameId: string) => {
        await axios.delete(`http://localhost:3002/game/${gameId}`);

        removeGame(gameId)
    }, [removeGame]);

    const setGameInfoSource = useCallback((game: Game, infoSource: InfoSource) => {
        game.infoSources = [
            infoSource,
            ...game.infoSources.filter(({ id }) => id !== infoSource.id),
        ];
        setGame(game.id, game);
    }, [setGame]);

    const addInfoSource = useCallback(async (game: Game, type: InfoSourceType, remoteGameId: string) => {
        const { data: infoSource } = await axios.post<any>(`http://localhost:3002/info-source`, {
            gameId: game.id,
            type,
            remoteGameId
        });

        setGameInfoSource(game, infoSource);

        return infoSource;
    }, [setGameInfoSource]);

    const syncInfoSource = useCallback(async (game: Game, infoSource: InfoSource) => {
        // TODO: this is ugly,
        // => Leads to name/image jump
        infoSource.data = null;
        setGameInfoSource(game, infoSource);

        const { data } = await axios.post<any>(`http://localhost:3002/info-source/${infoSource.id}/sync`);

        setGameInfoSource(game, data);
    }, [setGameInfoSource]);

    const disableInfoSource = useCallback(async (game: Game, infoSource: InfoSource) => {
        const { data } = await axios.post<any>(`http://localhost:3002/info-source/${infoSource.id}/disable`);

        setGameInfoSource(game, data);
    }, [setGameInfoSource]);


    const contextValue = useMemo(() => ({
        games,
        addGame,
        syncGame,
        deleteGame,
        addInfoSource,
        syncInfoSource,
        disableInfoSource
    }), [games, addGame, syncGame, deleteGame, addInfoSource, syncInfoSource, disableInfoSource]);

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    )
}