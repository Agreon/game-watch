import React, { useCallback, useMemo, useState } from 'react'
import { Button } from '@chakra-ui/button';
import { EditIcon } from '@chakra-ui/icons';
import { Box, Flex, Text } from '@chakra-ui/layout';
import { useColorModeValue } from "@chakra-ui/react";
import { useTagContext } from '../providers/TagProvider';
import { Tag as ChakraTag } from "@chakra-ui/react";
import { TagWithToggleState } from './GameTags/EditGameTags';
import { InfoSourceType, Tag, useGamesContext } from '../providers/GamesProvider';
import { INFO_SOURCE_PRIORITY } from '../providers/GameProvider';

interface InfoSourceWithToggleState {
    type: InfoSourceType
    toggled: boolean
}

export const InfoSourceFilter: React.FC<{
    filterInfoSources: InfoSourceType[],
    setFilterInfoSources: React.Dispatch<React.SetStateAction<InfoSourceType[]>>
}> = ({ filterInfoSources, setFilterInfoSources }) => {
    const sourcesWithToggleState = useMemo(() => {
        return INFO_SOURCE_PRIORITY.map(source => ({
            type: source,
            toggled: filterInfoSources.some(type => type === source)
        }));
    }, [filterInfoSources]);

    const toggleInfoSource = useCallback(async (selectedSource: InfoSourceWithToggleState) => {
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
                        onClick={() => toggleInfoSource(source)}
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
 * - On Outside click / esc
 * - Cancel
 */
export const FilterMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { tags: allTags } = useTagContext();
    const { filter, setFilter } = useGamesContext();
    const [filterInfoSources, setFilterInfoSources] = useState<InfoSourceType[]>(filter.infoSources);
    const [filterTags, setFilterTags] = useState<Tag[]>(filter.tags);

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
        setFilter({
            infoSources: filterInfoSources,
            tags: filterTags
        });
        onClose();
    }, [onClose, filterTags, filterInfoSources, setFilter]);

    return (
        <Flex
            position="absolute"
            direction="column"
            top="100%"
            right="0"
            bg={useColorModeValue('white', 'gray.800')}
            border="1px"
            borderColor={useColorModeValue("grey", "white")}
            px="2rem"
            pt="2rem"
            pb="1rem"
            width="30rem"
            zIndex="2"
            rounded="lg"
            shadow="lg"
            boxShadow="xl"
        >
            <InfoSourceFilter filterInfoSources={filterInfoSources} setFilterInfoSources={setFilterInfoSources} />
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

export const Filter: React.FC = () => {
    const { filter } = useGamesContext();
    const [showMenu, setShowMenu] = useState(false);

    const filterActive = filter.infoSources.length || filter.tags.length;

    return (
        <Flex align="center" height="100%" position="absolute" right="1rem" top="0">
            <Button
                leftIcon={<EditIcon />}
                colorScheme={filterActive ? "teal" : undefined}
                variant={filterActive ? "outline" : "ghost"}
                onClick={() => setShowMenu(true)}
            >
                Filter
            </Button>
            {showMenu && <FilterMenu onClose={() => setShowMenu(false)} />}
        </Flex>
    )
}