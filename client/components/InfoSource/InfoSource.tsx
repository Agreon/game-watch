import React from "react"
import { StoreInfoSource } from "./StoreInfoSource"
import { MetacriticInfoSource } from "./MetacriticInfoSource"
import { InfoSourceType, MetacriticData } from "@game-watch/shared";
import { useInfoSourceContext } from "../../providers/InfoSourceProvider";

export const InfoSource: React.FC = () => {
    const { source } = useInfoSourceContext();

    switch (source.type) {
        case InfoSourceType.Steam:
        case InfoSourceType.Switch:
        case InfoSourceType.PsStore:
        case InfoSourceType.Epic:
            return <StoreInfoSource data={source.data} />
        case InfoSourceType.Metacritic:
            return <MetacriticInfoSource data={source.data as MetacriticData} />;
    }
}
