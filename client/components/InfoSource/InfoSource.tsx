import React from "react"
import { StoreInfoSource } from "./StoreInfoSource"
import { InfoSource as Source } from "../../providers/GameProvider"

export const InfoSource: React.FC<{ source: Source }> = ({ source }) => {
    switch (source.type) {
        case "steam":
            return <StoreInfoSource source={source} expectedDateFormats={["D MMM, YYYY", "D MMMM, YYYY"]} />
        case "nintendo":
            return <StoreInfoSource source={source} expectedDateFormats={["DD.MM.YYYY"]} />
        case "psStore":
        default:
            return <StoreInfoSource source={source} expectedDateFormats={["DD.M.YYYY"]} />
    }
}