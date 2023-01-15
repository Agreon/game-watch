import { InfoSourceDto, InfoSourceState } from '@game-watch/shared';
import React, { useCallback, useContext, useMemo } from 'react';

import { useErrorHandler } from '../util/useErrorHandler';
import { useHttp } from '../util/useHttp';
import { usePolling } from '../util/usePolling';

export interface InfoSourceCtx {
    source: InfoSourceDto
    syncInfoSource: () => Promise<void>
    disableInfoSource: (continueSearching: boolean) => Promise<void>
}

export const InfoSourceContext = React.createContext<InfoSourceCtx | undefined>(undefined);

export function useInfoSourceContext() {
    const context = useContext(InfoSourceContext);

    return context as InfoSourceCtx;
}

export const InfoSourceProvider: React.FC<{
    children: React.ReactChild
    source: InfoSourceDto
    setGameInfoSource: (infoSource: InfoSourceDto) => void
    removeGameInfoSource: (id: string) => void
}> = ({ children, source, setGameInfoSource, removeGameInfoSource }) => {
    const { withRequest, http } = useHttp();
    const handleError = useErrorHandler();

    const pollInfoSource = useCallback(async () => {
        if (source.state !== InfoSourceState.Found) {
            return true;
        }

        const { data } = await http.get<InfoSourceDto>(`/info-source/${source.id}`);
        setGameInfoSource(data);

        return data.state !== InfoSourceState.Found;
    }, [http, setGameInfoSource, source.id, source.state]);
    usePolling(pollInfoSource, 1000, [source.state]);

    const syncInfoSource = useCallback(async () => {
        const previousState = source.state;
        setGameInfoSource({
            ...source,
            state: InfoSourceState.Found,
        });

        await withRequest(async http => {
            const { data } = await http.post<InfoSourceDto>(`/info-source/${source.id}/sync`);

            setGameInfoSource(data);
        }, error => {
            setGameInfoSource({
                ...source,
                state: previousState
            });
            handleError(error);
        });
    }, [source, withRequest, setGameInfoSource, handleError]);

    const disableInfoSource = useCallback(async (continueSearching: boolean) => {
        removeGameInfoSource(source.id);

        await withRequest(async http => {
            const { data: { id } } = await http.post<InfoSourceDto>(
                `/info-source/${source.id}/disable`,
                { continueSearching }
            );

            removeGameInfoSource(id);
        }, error => {
            setGameInfoSource(source);
            handleError(error);
        });
    }, [source, withRequest, handleError, setGameInfoSource, removeGameInfoSource]);

    const contextValue = useMemo(() => ({
        source,
        syncInfoSource,
        disableInfoSource,
    }), [source, syncInfoSource, disableInfoSource]);

    return (
        <InfoSourceContext.Provider value={contextValue}>
            {children}
        </InfoSourceContext.Provider>
    );
};
