import { Box } from "@chakra-ui/layout";
import React from "react";
import { AddInfoSource } from "../GameTile/AddInfoSource";
import { InfoSource } from "./InfoSource";
import { InfoSourceProvider } from "../../providers/InfoSourceProvider";
import { InfoSourceDto } from "@game-watch/shared";

interface InfoSourceListProps {
    activeInfoSources: InfoSourceDto[];
    setGameInfoSource: (source: InfoSourceDto) => void;
    disabledAdd: boolean;
}

// TODO: Maybe this component is not necessary anymore
const InfoSourceListComponent: React.FC<InfoSourceListProps> = ({ activeInfoSources, setGameInfoSource, disabledAdd }) => {
    return (
        <>
            <Box>
                {activeInfoSources.map(source =>
                    <InfoSourceProvider
                        key={source.id}
                        source={source}
                        setGameInfoSource={setGameInfoSource}
                    >
                        <InfoSource />
                    </InfoSourceProvider>
                )}
            </Box>
            {!disabledAdd && <AddInfoSource />}
        </>
    )
}

export const InfoSourceList = React.memo(InfoSourceListComponent);
