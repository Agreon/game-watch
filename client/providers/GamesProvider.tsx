import { CreateGameDto, GameDto, InfoSourceType, TagDto } from '@game-watch/shared';
import { AxiosResponse } from 'axios';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useHttp } from '../util/useHttp';
import { useScrollPagination } from '../util/useScollPagination';
import { useNotificationContext } from './NotificationProvider';
import { useUserContext } from './UserProvider';

export interface GamesFilter {
    tags: TagDto[]
    infoSources: InfoSourceType[]
    showOnlyAlreadyReleased: boolean
}

export interface GamesCtx {
    games: GameDto[]
    gamesLoading: boolean
    addGame: (search: string) => Promise<GameDto | Error>
    setGame: (id: string, cb: ((current: GameDto) => GameDto) | GameDto) => void
    removeGame: (id: string) => void
    fetchGames: (loadAll?: boolean) => Promise<void>
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

// This value needs to stay out of the react state management.
// Otherwise the fetchGames method has problems keeping up with the value and produces incorrect
// behavior.
let offset = 0;

export const GamesProvider: React.FC<{
    children: React.ReactElement,
}> = ({ children }) => {
    // We don't have a reference to the window object outside of the component.
    const PAGINATION_STEP_SIZE = window.innerWidth > 1000 ? 12 : 5;

    const { user } = useUserContext();
    const { requestWithErrorHandling: requestWithErrorHandling } = useHttp();
    const { removeNotificationsForGame } = useNotificationContext();

    const [gamesLoading, setGamesLoading] = useState(false);
    const [allGamesLoaded, setAllGamesLoaded] = useState(false);
    const [games, setGames] = useState<GameDto[]>([]);
    const [filter, setFilter] = useState<GamesFilter>({
        tags: [],
        infoSources: [],
        showOnlyAlreadyReleased: false,
    });

    const fetchGames = useCallback(async (loadAll?: boolean) => {
        if (allGamesLoaded) {
            return;
        }
        setGamesLoading(true);
        await requestWithErrorHandling(async http => {
            const { data } = await http.get<GameDto[]>('/game', {
                params: {
                    withTags: filter.tags.map(tag => tag.id),
                    withInfoSources: filter.infoSources,
                    onlyAlreadyReleased: filter.showOnlyAlreadyReleased,
                    offset,
                    limit: loadAll ? undefined : PAGINATION_STEP_SIZE
                }
            });
            if (loadAll) {
                setAllGamesLoaded(true);
                setGames(data);
                return;
            }

            if (!data.length) {
                setAllGamesLoaded(true);
                return;
            }
            setGames(currentGames => [...currentGames, ...data]);
        });
        setGamesLoading(false);
    }, [requestWithErrorHandling, filter, PAGINATION_STEP_SIZE, allGamesLoaded]);

    const setGame = useCallback((id: string, cb: ((current: GameDto) => GameDto) | GameDto) => {
        setGames(currentGames => {
            const currentGame = currentGames.find(game => id === game.id) as GameDto;
            const newGame = typeof cb === 'function' ? cb(currentGame) : cb;
            return currentGames.map(game => game.id === newGame.id ? newGame : game);
        });
    }, []);

    const removeGame = useCallback((gameId: string) => {
        setGames(currentGames => currentGames.filter(({ id }) => id !== gameId));
        removeNotificationsForGame(gameId);
        if (offset > 0) {
            offset -= 1;
        }
    }, [removeNotificationsForGame]);

    const addGame = useCallback(async (search: string) => {
        return await requestWithErrorHandling(async http => {
            const { data } = await http.post<CreateGameDto, AxiosResponse<GameDto>>(
                '/game',
                { search }
            );
            setGames(currentGames => [data, ...currentGames]);
            offset += 1;

            return data;
        }, () => { });
    }, [requestWithErrorHandling, setGames]);

    // Reset state on filter or user change
    useEffect(() => {
        setGames([]);
        offset = 0;
        fetchGames();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, user.id]);

    const onScrollPagination = useCallback(() => {
        if (!gamesLoading && !allGamesLoaded) {
            offset += PAGINATION_STEP_SIZE;
            fetchGames();
        }
    }, [fetchGames, gamesLoading, allGamesLoaded, PAGINATION_STEP_SIZE]);

    useScrollPagination({
        loadAtScrollPercentage: 60,
        onScrollPagination
    });

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
