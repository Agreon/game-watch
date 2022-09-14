import { InfoSourceDto, InfoSourceState } from "@game-watch/shared";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useHttp } from "../util/useHttp";

export interface InfoSourceCtx {
    source: InfoSourceDto
    syncInfoSource: () => Promise<void>
    disableInfoSource: () => Promise<void>
    excludeInfoSource: () => Promise<void>
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
    const { withRequest, handleError } = useHttp();

    const [polling, setPolling] = useState(false);
    useEffect(() => {
        if (source.state !== InfoSourceState.Found || polling) {
            return;
        }
        setPolling(true);

        (async () => {
            await withRequest(async http => {
                do {
                    try {
                        const { data } = await http.get<InfoSourceDto>(`/info-source/${source.id}`);
                        setGameInfoSource(data);
                        if (data.state !== InfoSourceState.Found) {
                            break;
                        }
                    } catch (error) {
                        handleError(error);
                    } finally {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                } while (true);
            });
            setPolling(false);
        }
        )();
    }, [source, polling, handleError, setGameInfoSource, withRequest]);

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

    const disableInfoSource = useCallback(async () => {
        removeGameInfoSource(source.id);

        await withRequest(async http => {
            const { data: { id } } = await http.post<InfoSourceDto>(`/info-source/${source.id}/disable`);

            removeGameInfoSource(id);
        }, error => {
            setGameInfoSource(source);
            handleError(error);
        });
    }, [source, withRequest, handleError, setGameInfoSource, removeGameInfoSource]);

    const excludeInfoSource = useCallback(async () => {
        removeGameInfoSource(source.id);

        await withRequest(async http => {
            const { data: { id } } = await http.post<InfoSourceDto>(`/info-source/${source.id}/exclude`);

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
        excludeInfoSource
    }), [source, syncInfoSource, disableInfoSource, excludeInfoSource]);

    return (
        <InfoSourceContext.Provider value={contextValue}>
            {children}
        </InfoSourceContext.Provider>
    );
};
