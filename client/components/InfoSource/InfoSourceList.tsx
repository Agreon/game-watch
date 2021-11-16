import { Box } from "@chakra-ui/layout";
import React, { useCallback } from "react";
import { AddInfoSource } from "../GameTile/AddInfoSource";
import { InfoSource } from "./InfoSource";
import { InfoSourceProvider } from "../../providers/InfoSourceProvider";
import { useHttp } from "../../util/useHttp";
import { InfoSourceDto } from "@game-watch/shared";
import { InfoSourceWithLoadingState } from "../../providers/GameProvider";

interface InfoSourceListProps {
    activeInfoSources: InfoSourceDto[];
    setGameInfoSource: (source: InfoSourceWithLoadingState) => void;
}

const InfoSourceListComponent: React.FC<InfoSourceListProps> = ({ activeInfoSources, setGameInfoSource }) => {
    const { withRequest, handleError } = useHttp();

    const syncInfoSource = useCallback(async (infoSource: InfoSourceDto) => {
        setGameInfoSource({
            ...infoSource,
            loading: true
        });

        await withRequest(async http => {
            const { data } = await http.post<InfoSourceDto>(`/info-source/${infoSource.id}/sync`);

            setGameInfoSource(data);
        }, error => {
            setGameInfoSource({
                ...infoSource,
                loading: false
            });
            handleError(error);
        });
    }, [withRequest, setGameInfoSource, handleError]);

    const disableInfoSource = useCallback(async (infoSource: InfoSourceDto) => {
        setGameInfoSource({
            ...infoSource,
            loading: true
        });

        await withRequest(async http => {
            const { data } = await http.post<InfoSourceDto>(`/info-source/${infoSource.id}/disable`);

            setGameInfoSource(data);
        }, error => {
            setGameInfoSource({
                ...infoSource,
                loading: false
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
                    >
                        <InfoSource />
                    </InfoSourceProvider>
                )}
            </Box>
            <AddInfoSource syncInfoSource={syncInfoSource} />
        </>
    )
}

export const InfoSourceList = React.memo(InfoSourceListComponent);