import { AxiosResponse } from "axios";
import React, { useCallback, useContext, useMemo } from "react";
import { http } from "../util/http";
import { Game, InfoSource, InfoSourceType } from "./GamesProvider";
import { useGameContext } from "./GameProvider";

export interface InfoSourceCtx {
    infoSources: InfoSource[]
    addInfoSource: (type: InfoSourceType, remoteGameId: string) => Promise<InfoSource>
    syncInfoSource: (infoSource: InfoSource) => Promise<void>
    disableInfoSource: (infoSource: InfoSource) => Promise<void>
}

export const InfoSourceContext = React.createContext<InfoSourceCtx>({
    infoSources: [],
    addInfoSource: async () => ({} as InfoSource),
    syncInfoSource: async () => { },
    disableInfoSource: async () => { },
});

export function useInfoSourceContext() {
    const context = useContext(InfoSourceContext);

    return context as InfoSourceCtx;
}

export const InfoSourceProvider: React.FC<{ game: Game }> = ({ children, game }) => {
    const { setGameInfoSource } = useGameContext();

    const addInfoSource = useCallback(async (type: InfoSourceType, remoteGameId: string) => {
        const { data: infoSource } = await http.post<unknown, AxiosResponse<InfoSource>>(`/info-source`, {
            gameId: game.id,
            type,
            remoteGameId
        });

        setGameInfoSource(infoSource);

        return infoSource;
    }, [game.id, setGameInfoSource]);

    const syncInfoSource = useCallback(async (infoSource: InfoSource) => {
        setGameInfoSource({
            ...infoSource,
            loading: true
        });

        const { data } = await http.post<InfoSource>(`/info-source/${infoSource.id}/sync`);

        setGameInfoSource(data);
    }, [setGameInfoSource]);

    const disableInfoSource = useCallback(async (infoSource: InfoSource) => {
        setGameInfoSource({
            ...infoSource,
            loading: true
        });

        const { data } = await http.post<InfoSource>(`/info-source/${infoSource.id}/disable`);

        setGameInfoSource(data);
    }, [setGameInfoSource]);

    const contextValue = useMemo(() => ({
        infoSources: game.infoSources,
        addInfoSource,
        syncInfoSource,
        disableInfoSource
    }), [game.infoSources, addInfoSource, syncInfoSource, disableInfoSource]);

    return (
        <InfoSourceContext.Provider value={contextValue}>
            {children}
        </InfoSourceContext.Provider>
    )
}