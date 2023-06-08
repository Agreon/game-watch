import { GameDto } from '@game-watch/shared';
import { useCallback, useEffect, useState } from 'react';

import { GamesFilter } from '../providers/GamesProvider';
import { useUserContext } from '../providers/UserProvider';
import { useHttp } from './useHttp';
import { useScrollPagination } from './useScollPagination';

// This value needs to stay out of the react state management as it is used as a kind of lock.
// Otherwise the `onScrollPagination` method has problems keeping up with the value if executed
// multiple times in a short time and that produces duplicate requests.
let gamesLoading = false;

export function useGameFetch() {
    // We don't have a reference to the window object outside of the component.
    const PAGINATION_STEP_SIZE = window.innerWidth > 1000 ? 12 : 5;

    const { user } = useUserContext();
    const { requestWithErrorHandling: requestWithErrorHandling } = useHttp();

    const [nextOffset, setNextOffset] = useState(0);
    const [allGamesLoaded, setAllGamesLoaded] = useState(false);
    const [games, setGames] = useState<GameDto[]>([]);
    const [filter, setFilter] = useState<GamesFilter>({
        tags: [],
        infoSources: [],
        showOnlyAlreadyReleased: false,
        showEarlyAccessGames: true,
    });

    const fetchGames = useCallback(async (offset: number, loadAll?: boolean) => {
        gamesLoading = true;
        await requestWithErrorHandling(async http => {
            const { data } = await http.get<GameDto[]>('/game', {
                params: {
                    withTags: filter.tags.map(tag => tag.id),
                    withInfoSources: filter.infoSources,
                    onlyAlreadyReleased: filter.showOnlyAlreadyReleased,
                    includeEarlyAccessGames: filter.showEarlyAccessGames,
                    offset: loadAll ? undefined : offset,
                    limit: loadAll ? undefined : PAGINATION_STEP_SIZE
                }
            });
            if (loadAll) {
                setAllGamesLoaded(true);
                setGames(data);
                return;
            }

            if (data.length < PAGINATION_STEP_SIZE) {
                setAllGamesLoaded(true);
            } else {
                setNextOffset(offset + PAGINATION_STEP_SIZE);
            }
            setGames(currentGames => [...currentGames, ...data]);
        });
        gamesLoading = false;
    }, [requestWithErrorHandling, filter, PAGINATION_STEP_SIZE]);

    // Reset state on filter or user change
    useEffect(() => {
        setGames([]);
        setAllGamesLoaded(false);
        fetchGames(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, user.id]);

    const onScrollPagination = useCallback(() => {
        if (!gamesLoading && !allGamesLoaded) {
            fetchGames(nextOffset);
        }
    }, [fetchGames, nextOffset, allGamesLoaded]);

    useScrollPagination({
        loadAtScrollPercentage: 60,
        onScrollPagination
    });

    const increasePaginationOffset = useCallback(
        () => setNextOffset(currentOffset => currentOffset + 1), []
    );

    const decreasePaginationOffset = useCallback(
        () => setNextOffset(currentOffset => currentOffset - 1), []
    );

    return {
        games,
        setGames,
        filter,
        setFilter,
        gamesLoading,
        fetchGames,
        increasePaginationOffset,
        decreasePaginationOffset
    };
}
