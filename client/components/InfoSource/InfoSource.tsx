import React from "react"
import { StoreInfoSource } from "./StoreInfoSource"
import { MetacriticInfoSource } from "./MetacriticInfoSource"
import { InfoSourceType, MetacriticData } from "@game-watch/shared";
import { useInfoSourceContext } from "../../providers/InfoSourceProvider";

export const InfoSource: React.FC = () => {
    const { source } = useInfoSourceContext();

    switch (source.type) {
        case InfoSourceType.Steam:
            return <StoreInfoSource
                data={source.data}
                expectedDateFormats={["D MMM, YYYY", "D MMMM, YYYY"]} />
        case InfoSourceType.Switch:
            return <StoreInfoSource
                data={source.data}
                expectedDateFormats={["DD.MM.YYYY"]} />
        case InfoSourceType.PsStore:
            return <StoreInfoSource
                data={source.data}
                expectedDateFormats={["D.M.YYYY"]} />
        case InfoSourceType.Epic:
            return <StoreInfoSource
                data={source.data}
                expectedDateFormats={["YYYY-MM-DD"]} />
        case InfoSourceType.Metacritic:
            return <MetacriticInfoSource data={source.data as MetacriticData} />;
    }
}
