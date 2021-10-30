import React, { useCallback, useMemo, useState } from 'react'
import { Button } from '@chakra-ui/button';
import { EditIcon } from '@chakra-ui/icons';
import { Box, Flex, Text } from '@chakra-ui/layout';
import { useColorModeValue } from "@chakra-ui/react";
import { useTagContext } from '../providers/TagProvider';
import { Tag as ChakraTag } from "@chakra-ui/react";
import { TagWithToggleState } from './GameTags/EditGameTags';
import { InfoSourceType, Tag, useGamesContext } from '../providers/GamesProvider';

const ALL_INFO_SOURCES = [
    InfoSourceType.PsStore,
    InfoSourceType.Steam,
    InfoSourceType.Switch,
    InfoSourceType.Epic,
    InfoSourceType.Metacritic,
];

interface InfoSourceWithToggleState {
    type: InfoSourceType
    toggled: boolean
}

export const InfoSourceFilter: React.FC = () => {
    const [filterInfoSources, setFilterInfoSources] = useState<InfoSourceType[]>([]);

    const sourcesWithToggleState = useMemo(() => {
        return ALL_INFO_SOURCES.map(source => ({
            type: source,
            toggled: filterInfoSources.some(type => type === source)
        }));
    }, [filterInfoSources]);


    const toggleInfSource = useCallback(async (selectedSource: InfoSourceWithToggleState) => {
        if (selectedSource.toggled) {
            setFilterInfoSources(sources => [...sources].filter(source => source !== selectedSource.type))
        } else {
            setFilterInfoSources(sources => [...sources, selectedSource.type])
        }
    }, [setFilterInfoSources]);

    return (
        <Box>
            <Text fontSize="lg">InfoSources</Text>
            <Box ml="-0.5rem" >
                {sourcesWithToggleState.map(source => (
                    <ChakraTag
                        key={source.type}
                        onClick={() => toggleInfSource(source)}
                        variant={source.toggled ? "subtle" : "outline"}
                        colorScheme={source.toggled ? "blue" : "whiteAlpha"}
                        cursor="pointer"
                        ml="0.5rem"
                        mt="0.5rem"
                    >
                        {source.type}
                    </ChakraTag>
                ))}
            </Box>
        </Box>
    );
}

/**
 * TODO:
 * - Extract tags to component
 */
export const FilterMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    // TODO: Just set these as defaults and use a themed color everywhere.
    const popUpBgColor = useColorModeValue('white', 'gray.800');
    const { tags: allTags } = useTagContext();
    const { setFilter } = useGamesContext();
    const [filterTags, setFilterTags] = useState<Tag[]>([]);

    const tagsWithToggleState = useMemo(() => {
        return allTags.map(tag => ({
            ...tag,
            toggled: filterTags.some(({ id }) => id === tag.id)
        }));
    }, [allTags, filterTags]);

    const toggleTag = useCallback(async (selectedTag: TagWithToggleState) => {
        if (selectedTag.toggled) {
            setFilterTags(tags => [...tags].filter(tag => tag.id !== selectedTag.id))
        } else {
            setFilterTags(tags => [...tags, selectedTag])
        }
    }, [setFilterTags]);

    const applyFilter = useCallback(() => {
        setFilter(filter => ({
            ...filter,
            tags: filterTags
        }))
        onClose();
    }, [onClose, filterTags, setFilter]);

    return (
        <Flex
            position="absolute"
            direction="column"
            top="100%"
            right="0"
            bg={popUpBgColor}
            px="2rem"
            py="1rem"
            width="30rem"
            zIndex="2"
            rounded="lg"
            shadow="lg"
            boxShadow="xl"
        >
            <InfoSourceFilter />
            <Box mt="1rem">
                <Text fontSize="lg">Tags</Text>
                <Box ml="-0.5rem" >
                    {tagsWithToggleState.map(tag => (
                        <ChakraTag
                            key={tag.id}
                            onClick={() => toggleTag(tag)}
                            variant={tag.toggled ? "subtle" : "outline"}
                            colorScheme={tag.toggled ? tag.color : "whiteAlpha"}
                            cursor="pointer"
                            ml="0.5rem"
                            mt="0.5rem"
                        >
                            {tag.name}
                        </ChakraTag>
                    ))}
                </Box>
            </Box>
            <Flex justify="end">
                <Button mt="1rem" onClick={applyFilter} colorScheme="teal">Apply</Button>
            </Flex>
        </Flex>
    )
}

/**
 * TODO: Some highlight if filter is active
 */
export const Filter: React.FC = () => {
    const [showMenu, setShowMenu] = useState(true);

    return (
        <Flex align="center" height="100%" position="absolute" right="1rem" top="0">
            <Button variant={showMenu ? "solid" : "ghost"} leftIcon={<EditIcon />} onClick={() => setShowMenu(true)}>
                Filter
            </Button>
            {showMenu && <FilterMenu onClose={() => setShowMenu(false)} />}
        </Flex>
    )
}