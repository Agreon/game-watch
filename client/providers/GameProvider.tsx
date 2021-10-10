import axios from "axios";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { useList } from "react-use";

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
    const [games, setGames] = useState(initialGames);
    // const [games, {set, setAll, remove, reset}] = useMap({
    //     hello: 'there',
    //   });

    const addGame = useCallback(async (name: string) => {
        const { data } = await axios.post<any>("http://localhost:3002/game", { search: name });

        setGames(games => [data, ...games]);
    }, [setGames]);


    const syncGame = useCallback(async (gameId: string) => {
        const { data } = await axios.post<any>(`http://localhost:3002/game/${gameId}/sync`);

        setGames(games => [
            data!,
            ...games.filter(game => game.id !== gameId),
        ]);
    }, [setGames]);


    const deleteGame = useCallback(async (gameId: string) => {
        await axios.delete(`http://localhost:3002/game/${gameId}`);

        setGames(games => games.filter(game => game.id !== gameId));
    }, [setGames])

    const addInfoSource = useCallback(async (game: Game, type: InfoSourceType, remoteGameId: string) => {
        const { data: infoSource } = await axios.post<any>(`http://localhost:3002/info-source`, {
            gameId: game.id,
            type,
            remoteGameId
        });

        game.infoSources = [...game.infoSources, infoSource];

        setGames(games => [
            game!,
            ...games.filter(({ id }) => id !== game.id),
        ]);

        return infoSource;
    }, [setGames]);

    const syncInfoSource = useCallback(async (game: Game, infoSource: InfoSource) => {
        // TODO: this is ugly
        infoSource.data = null;
        game.infoSources = [
            infoSource,
            ...game.infoSources.filter(({ id }) => id !== infoSource.id),
        ];
        setGames(games => [
            game!,
            ...games.filter(({ id }) => id !== game.id),
        ]);

        const { data } = await axios.post<any>(`http://localhost:3002/info-source/${infoSource.id}/sync`);

        game.infoSources = [
            data,
            ...game.infoSources.filter(({ id }) => id !== infoSource.id),
        ];

        setGames(games => [
            game!,
            ...games.filter(({ id }) => id !== game.id),
        ]);
    }, [setGames]);

    const disableInfoSource = useCallback(async (game: Game, infoSource: InfoSource) => {
        const { data } = await axios.post<any>(`http://localhost:3002/info-source/${infoSource.id}/disable`);

        // TODO: Not Sorted by type
        game.infoSources = [
            data,
            ...game.infoSources.filter(({ id }) => id !== infoSource.id),
        ];

        setGames(games => [
            game!,
            ...games.filter(({ id }) => id !== game.id),
        ]);
    }, [setGames]);


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