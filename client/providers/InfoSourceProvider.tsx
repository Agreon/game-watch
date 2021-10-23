import React, { useCallback, useContext, useMemo } from "react";
import { InfoSource } from "./GamesProvider";
import { useGameContext } from "./GameProvider";
import { useHttp } from "../util/useHttp";

export interface InfoSourceCtx {
    infoSources: InfoSource[]
    syncInfoSource: (infoSource: InfoSource) => Promise<void>
    disableInfoSource: (infoSource: InfoSource) => Promise<void>
}

export const InfoSourceContext = React.createContext<InfoSourceCtx>({
    infoSources: [],
    syncInfoSource: async () => { },
    disableInfoSource: async () => { },
});

export function useInfoSourceContext() {
    const context = useContext(InfoSourceContext);

    return context as InfoSourceCtx;
}

export const InfoSourceProvider: React.FC<{ infoSources: InfoSource[] }> = ({ children, infoSources }) => {
    const { setGameInfoSource } = useGameContext();
    const { withRequest, handleError } = useHttp();

    const syncInfoSource = useCallback(async (infoSource: InfoSource) => {
        setGameInfoSource({
            ...infoSource,
            loading: true
        });

        await withRequest(async http => {
            const { data } = await http.post<InfoSource>(`/info-source/${infoSource.id}/sync`);

            setGameInfoSource(data);
        }, error => {
            setGameInfoSource({
                ...infoSource,
                loading: false
            });
            handleError(error);
        });
    }, [withRequest, setGameInfoSource, handleError]);

    const disableInfoSource = useCallback(async (infoSource: InfoSource) => {
        setGameInfoSource({
            ...infoSource,
            loading: true
        });

        await withRequest(async http => {
            const { data } = await http.post<InfoSource>(`/info-source/${infoSource.id}/disable`);

            setGameInfoSource(data);
        }, error => {
            setGameInfoSource({
                ...infoSource,
                loading: false
            });
            handleError(error);
        });
    }, [withRequest, handleError, setGameInfoSource]);

    const contextValue = useMemo(() => ({
        infoSources,
        syncInfoSource,
        disableInfoSource
    }), [infoSources, syncInfoSource, disableInfoSource]);

    return (
        <InfoSourceContext.Provider value={contextValue}>
            {children}
        </InfoSourceContext.Provider>
    )
}