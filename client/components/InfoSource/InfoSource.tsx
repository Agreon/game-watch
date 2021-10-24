import React from "react"
import { StoreInfoSource } from "./StoreInfoSource"
import { InfoSourceType } from "../../providers/GamesProvider"
import { MetacriticInfoSource } from "./MetacriticInfoSource"

export const InfoSource: React.FC<{ type: InfoSourceType }> = ({ type }) => {
    switch (type) {
        case "steam":
            return <StoreInfoSource expectedDateFormats={["D MMM, YYYY", "D MMMM, YYYY"]} />
        case "switch":
            return <StoreInfoSource expectedDateFormats={["DD.MM.YYYY"]} />
        case "psStore":
            return <StoreInfoSource expectedDateFormats={["D.M.YYYY"]} />
        case "epic":
            return <StoreInfoSource expectedDateFormats={["YYYY-MM-DD"]} />
        default:
            return <MetacriticInfoSource />;
    }
}
