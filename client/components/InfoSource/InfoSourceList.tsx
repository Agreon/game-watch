import { Box } from "@chakra-ui/layout";
import React, { useCallback } from "react";
import { AddInfoSource } from "../GameTile/AddInfoSource";
import { InfoSource } from "./InfoSource";
import { InfoSourceProvider } from "../../providers/InfoSourceProvider";
import { useHttp } from "../../util/useHttp";
import { InfoSourceDto } from "@game-watch/shared";

interface InfoSourceListProps {
    activeInfoSources: InfoSourceDto[];
    setGameInfoSource: (source: InfoSourceDto) => void;
    disabledAdd: boolean;
}

const InfoSourceListComponent: React.FC<InfoSourceListProps> = ({ activeInfoSources, setGameInfoSource, disabledAdd }) => {
    const { withRequest, handleError } = useHttp();

    const syncInfoSource = useCallback(async (infoSource: InfoSourceDto) => {
        setGameInfoSource({
            ...infoSource,
            syncing: true
        });

        await withRequest(async http => {
            const { data } = await http.post<InfoSourceDto>(`/info-source/${infoSource.id}/sync`);

            setGameInfoSource(data);
        }, error => {
            setGameInfoSource({
                ...infoSource,
                syncing: false
            });
            handleError(error);
        });
    }, [withRequest, setGameInfoSource, handleError]);

    const disableInfoSource = useCallback(async (infoSource: InfoSourceDto) => {
        setGameInfoSource({
            ...infoSource,
            syncing: true
        });

        await withRequest(async http => {
            const { data } = await http.post<InfoSourceDto>(`/info-source/${infoSource.id}/disable`);

            setGameInfoSource(data);
        }, error => {
            setGameInfoSource({
                ...infoSource,
                syncing: false
            });
            handleError(error);
        });
    }, [withRequest, handleError, setGameInfoSource]);

    return (
        <>
            <Box>
                {activeInfoSources.map(source =>
                    <InfoSourceProvider
                        key={source.id}
                        source={source}
                        syncInfoSource={syncInfoSource}
                        disableInfoSource={disableInfoSource}
                        setGameInfoSource={setGameInfoSource}
                    >
                        <InfoSource />
                    </InfoSourceProvider>
                )}
            </Box>
            {!disabledAdd && <AddInfoSource syncInfoSource={syncInfoSource} />}
        </>
    )
}

export const InfoSourceList = React.memo(InfoSourceListComponent);