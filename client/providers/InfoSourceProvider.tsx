import { InfoSourceDto } from "@game-watch/shared";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useHttp } from "../util/useHttp";

export interface InfoSourceCtx {
    source: InfoSourceDto
    syncInfoSource: (infoSource: InfoSourceDto) => Promise<void>
    disableInfoSource: (infoSource: InfoSourceDto) => Promise<void>
    setGameInfoSource: (infoSource: InfoSourceDto) => void;
}

export const InfoSourceContext = React.createContext<InfoSourceCtx | undefined>(undefined);

export function useInfoSourceContext() {
    const context = useContext(InfoSourceContext);

    return context as InfoSourceCtx;
}

export const InfoSourceProvider: React.FC<InfoSourceCtx> = ({
    children,
    source,
    syncInfoSource,
    disableInfoSource,
    setGameInfoSource
}) => {
    const { withRequest } = useHttp();

    const [polling, setPolling] = useState(false);
    useEffect(() => {
        if (!source.syncing || polling) {
            return;
        }
        setPolling(true);
        (async () => {
            await withRequest(async http => {
                do {
                    const { data } = await http.get<InfoSourceDto>(`/info-source/${source.id}`);
                    setGameInfoSource(data);
                    if (data.syncing === false) {
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } while (true)
            });
            setPolling(false);
        }
        )();
    }, [source, polling, setGameInfoSource, withRequest]);

    const contextValue = useMemo(() => ({
        source,
        syncInfoSource,
        disableInfoSource,
        setGameInfoSource
    }), [source, syncInfoSource, disableInfoSource, setGameInfoSource]);

    return (
        <InfoSourceContext.Provider value={contextValue}>
            {children}
        </InfoSourceContext.Provider>
    )
}
