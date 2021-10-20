import React from "react"
import { StoreInfoSource } from "./StoreInfoSource"
import { InfoSource as Source } from "../../providers/GamesProvider"

export const InfoSource: React.FC<{ source: Source }> = ({ source }) => {
    switch (source.type) {
        case "steam":
            return <StoreInfoSource source={source} expectedDateFormats={["D MMM, YYYY", "D MMMM, YYYY"]} />
        case "switch":
            return <StoreInfoSource source={source} expectedDateFormats={["DD.MM.YYYY"]} />
        case "psStore":
        default:
            return <StoreInfoSource source={source} expectedDateFormats={["D.M.YYYY"]} />
    }
}