import { CreateGameDto, GameDto, InfoSourceType, TagDto } from '@game-watch/shared';
import { AxiosResponse } from 'axios';
import React, { useCallback, useContext, useMemo } from 'react';

import { useGameFetch } from '../util/useGameFetch';
import { useHttp } from '../util/useHttp';
import { useNotificationContext } from './NotificationProvider';

export interface GamesFilter {
    tags: TagDto[]
    infoSources: InfoSourceType[]
    showOnlyAlreadyReleased: boolean
    showEarlyAccessGames: boolean
}

export interface GamesCtx {
    games: GameDto[]
    gamesLoading: boolean
    addGame: (search: string) => Promise<GameDto | Error>
    setGame: (id: string, cb: ((current: GameDto) => GameDto) | GameDto) => void
    removeGame: (id: string) => void
    fetchGames: (offset: number, loadAll?: boolean) => Promise<void>
    filter: GamesFilter,
    setFilter: React.Dispatch<React.SetStateAction<GamesFilter>>
}

export const GamesContext = React.createContext<GamesCtx | null>(null);

export function useGamesContext() {
    const context = useContext(GamesContext);
    if (!context) {
        throw new Error('GamesContext must be used inside GamesProvider');
    }
    return context;
}

export const GamesProvider: React.FC<{
    children: React.ReactElement,
}> = ({ children }) => {
    const { requestWithErrorHandling: requestWithErrorHandling } = useHttp();
    const { removeNotificationsForGame } = useNotificationContext();
    const {
        games,
        setGames,
        filter,
        setFilter,
        fetchGames,
        gamesLoading,
        increasePaginationOffset,
        decreasePaginationOffset,
    } = useGameFetch();

    const setGame = useCallback((id: string, cb: ((current: GameDto) => GameDto) | GameDto) => {
        setGames(currentGames => {
            const currentGame = currentGames.find(game => id === game.id) as GameDto;
            const newGame = typeof cb === 'function' ? cb(currentGame) : cb;
            return currentGames.map(game => game.id === newGame.id ? newGame : game);
        });
    }, [setGames]);

    const addGame = useCallback(async (search: string) => {
        return await requestWithErrorHandling(async http => {
            const { data } = await http.post<CreateGameDto, AxiosResponse<GameDto>>(
                '/game',
                { search }
            );
            setGames(currentGames => [data, ...currentGames]);
            increasePaginationOffset();

            return data;
        }, () => { });
    }, [requestWithErrorHandling, setGames, increasePaginationOffset]);

    // Request is happening in GameProvider
    const removeGame = useCallback((gameId: string) => {
        setGames(currentGames => currentGames.filter(({ id }) => id !== gameId));
        removeNotificationsForGame(gameId);
        decreasePaginationOffset();
    }, [removeNotificationsForGame, decreasePaginationOffset, setGames]);

    const contextValue = useMemo(() => ({
        games,
        gamesLoading,
        addGame,
        setGame,
        removeGame,
        fetchGames,
        filter,
        setFilter
    }), [games, gamesLoading, addGame, setGame, removeGame, fetchGames, filter, setFilter]);

    return (
        <GamesContext.Provider value={contextValue}>
            {children}
        </GamesContext.Provider>
    );
};
