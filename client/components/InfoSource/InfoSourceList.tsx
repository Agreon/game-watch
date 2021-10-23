import { Box } from "@chakra-ui/layout";
import React, { useCallback } from "react";
import { AddInfoSource } from "../GameTile/AddInfoSource";
import { InfoSource } from "./InfoSource";
import { InfoSourceProvider } from "../../providers/InfoSourceProvider";
import { InfoSource as Source } from "../../providers/GamesProvider";
import { useHttp } from "../../util/useHttp";

interface InfoSourceListProps {
    activeInfoSources: Source[];
    setGameInfoSource: (source: Source) => void;
}

const InfoSourceListComponent: React.FC<InfoSourceListProps> = ({ activeInfoSources, setGameInfoSource }) => {
    const { withRequest, handleError } = useHttp();

    const syncInfoSource = useCallback(async (infoSource: Source) => {
        setGameInfoSource({
            ...infoSource,
            loading: true
        });

        await withRequest(async http => {
            const { data } = await http.post<Source>(`/info-source/${infoSource.id}/sync`);

            setGameInfoSource(data);
        }, error => {
            setGameInfoSource({
                ...infoSource,
                loading: false
            });
            handleError(error);
        });
    }, [withRequest, setGameInfoSource, handleError]);

    const disableInfoSource = useCallback(async (infoSource: Source) => {
        setGameInfoSource({
            ...infoSource,
            loading: true
        });

        await withRequest(async http => {
            const { data } = await http.post<Source>(`/info-source/${infoSource.id}/disable`);

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
                        <InfoSource type={source.type} />
                    </InfoSourceProvider>
                )}
            </Box>
            <AddInfoSource syncInfoSource={syncInfoSource} />
        </>
    )
}

export const InfoSourceList = React.memo(InfoSourceListComponent);