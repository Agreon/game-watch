import React, { useContext, useMemo } from "react";
import { InfoSource } from "./GamesProvider";

export interface InfoSourceCtx {
    source: InfoSource
    syncInfoSource: (infoSource: InfoSource) => Promise<void>
    disableInfoSource: (infoSource: InfoSource) => Promise<void>
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