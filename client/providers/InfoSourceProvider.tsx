import { InfoSourceDto } from "game-watch-shared";
import React, { useContext, useMemo } from "react";
import { InfoSourceWithLoadingState } from "./GameProvider";

export interface InfoSourceCtx {
    source: InfoSourceWithLoadingState
    syncInfoSource: (infoSource: InfoSourceDto) => Promise<void>
    disableInfoSource: (infoSource: InfoSourceDto) => Promise<void>
}

export const InfoSourceContext = React.createContext<InfoSourceCtx | undefined>(undefined);

export function useInfoSourceContext() {
    const context = useContext(InfoSourceContext);

    return context as InfoSourceCtx;
}

export const InfoSourceProvider: React.FC<InfoSourceCtx> = ({ children, source, syncInfoSource, disableInfoSource }) => {
    const contextValue = useMemo(() => ({
        source,
        syncInfoSource,
        disableInfoSource
    }), [source, syncInfoSource, disableInfoSource]);

    return (
        <InfoSourceContext.Provider value={contextValue}>
            {children}
        </InfoSourceContext.Provider>
    )
}

// export const InfoSourceProvider = React.memo(InfoSourceProviderComponent);