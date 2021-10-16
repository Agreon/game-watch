import { Box } from "@chakra-ui/layout";
import React from "react";
import { Game, InfoSource as Source } from "../../providers/GameProvider";
import { AddInfoSource } from "../GameTile/AddInfoSource";
import { InfoSource } from "./InfoSource";
import { InfoSourceProvider } from "../../providers/InfoSourceProvider";

export interface InfoSourcesProps {
    game: Game
    infoSources: Source[]
}

export const InfoSourceList: React.FC<InfoSourcesProps> = ({ game, infoSources }) => {
    return (
        <InfoSourceProvider game={game}>
            <Box>{infoSources.map(source => <InfoSource key={source.id} source={source} />)}</Box>
            <AddInfoSource />
        </InfoSourceProvider>
    )
}