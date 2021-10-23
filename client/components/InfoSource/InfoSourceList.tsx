import { Box } from "@chakra-ui/layout";
import React from "react";
import { AddInfoSource } from "../GameTile/AddInfoSource";
import { InfoSource } from "./InfoSource";
import { InfoSourceProvider } from "../../providers/InfoSourceProvider";
import { InfoSource as Source } from "../../providers/GamesProvider";

const InfoSourceListComponent: React.FC<{ infoSources: Source[] }> = ({ infoSources }) => {
    return (
        <InfoSourceProvider infoSources={infoSources}>
            <Box>{infoSources.map(source => <InfoSource key={source.id} source={source} />)}</Box>
            <AddInfoSource />
        </InfoSourceProvider>
    )
}

export const InfoSourceList = React.memo(InfoSourceListComponent);