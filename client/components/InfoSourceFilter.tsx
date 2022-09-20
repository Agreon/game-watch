import { Box, Flex } from '@chakra-ui/react';
import { InfoSourceType } from '@game-watch/shared';
import React, { useCallback, useMemo } from 'react';

import { SourceTypeLogoWithName } from './InfoSource/SourceTypeLogo';

interface InfoSourceWithToggleState {
    type: InfoSourceType
    toggled: boolean
}

export const InfoSourceFilter: React.FC<{
    availableInfoSources: InfoSourceType[],
    filterInfoSources: InfoSourceType[],
    setFilterInfoSources: React.Dispatch<React.SetStateAction<InfoSourceType[]>>
}> = ({ availableInfoSources, filterInfoSources, setFilterInfoSources }) => {

    const toggleInfoSource = useCallback(async (selectedSource: InfoSourceWithToggleState) => {
        if (selectedSource.toggled) {
            setFilterInfoSources(
                sources => [...sources].filter(source => source !== selectedSource.type)
            );
        } else {
            setFilterInfoSources(sources => [...sources, selectedSource.type]);
        }
    }, [setFilterInfoSources]);

    const sourcesWithToggleState = useMemo(
        () => availableInfoSources.map(source => ({
            type: source,
            toggled: filterInfoSources.some(type => type === source)
        })),
        [availableInfoSources, filterInfoSources]
    );

    return (
        <Flex flexWrap="wrap">
            {sourcesWithToggleState.map(source => (
                <Box
                    key={source.type}
                    bg={'gray.800'}
                    borderColor={source.toggled ? 'teal.500' : 'none'}
                    borderWidth='2px'
                    borderRadius='lg'
                    mx="0.5rem"
                    my="0.25rem"
                    p="0.5rem"
                    cursor="pointer"
                    onClick={() => toggleInfoSource(source)}
                >
                    {SourceTypeLogoWithName[source.type]}
                </Box>
            ))}
        </Flex>
    );
};
