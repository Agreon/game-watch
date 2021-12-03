import React from "react"
import { StoreInfoSource, StoreInfoSourcePreview } from "./StoreInfoSource"
import { MetacriticInfoSource, MetacriticInfoSourcePreview } from "./MetacriticInfoSource"
import { InfoSourceDto, InfoSourceType, MetacriticData, StoreInfoSource as StoreInfoSourceT } from "@game-watch/shared";
import { useInfoSourceContext } from "../../providers/InfoSourceProvider";

// TODO: Type discrimination does not work
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

// TODO: expectedformats as map in StoreInfoSource?
export const InfoSourcePreview: React.FC = () => {
    const { source } = useInfoSourceContext();

    switch (source.type) {
        case InfoSourceType.Steam:
            return <StoreInfoSourcePreview
                source={source as InfoSourceDto<StoreInfoSourceT>}
                expectedDateFormats={["D MMM, YYYY", "D MMMM, YYYY"]} />
        case InfoSourceType.Switch:
            return <StoreInfoSourcePreview
                source={source as InfoSourceDto<StoreInfoSourceT>}
                expectedDateFormats={["DD.MM.YYYY"]} />
        case InfoSourceType.PsStore:
            return <StoreInfoSourcePreview
                source={source as InfoSourceDto<StoreInfoSourceT>}
                expectedDateFormats={["D.M.YYYY"]} />
        case InfoSourceType.Epic:
            return <StoreInfoSourcePreview
                source={source as InfoSourceDto<StoreInfoSourceT>}
                expectedDateFormats={["YYYY-MM-DD"]} />
        case InfoSourceType.Metacritic:
            return <MetacriticInfoSourcePreview
                data={source.data as MetacriticData} />;
    }
}