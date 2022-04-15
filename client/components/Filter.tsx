import { EditIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Popover, PopoverContent, PopoverTrigger, Text, useColorModeValue } from "@chakra-ui/react";
import { Tag as ChakraTag } from "@chakra-ui/react";
import { InfoSourceType, TagDto } from '@game-watch/shared';
import React, { useCallback, useMemo, useState } from 'react';

import { INFO_SOURCE_PRIORITY } from '../providers/GameProvider';
import { useGamesContext } from '../providers/GamesProvider';
import { useTagContext } from '../providers/TagProvider';
import { TagWithToggleState } from './GameTags/EditGameTags';

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
            setFilterInfoSources(sources => [...sources].filter(source => source !== selectedSource.type));
        } else {
            setFilterInfoSources(sources => [...sources, selectedSource.type]);
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
};

export const FilterMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { tags: allTags } = useTagContext();
    const { filter, setFilter } = useGamesContext();
    const [filterInfoSources, setFilterInfoSources] = useState<InfoSourceType[]>(filter.infoSources);
    const [filterTags, setFilterTags] = useState<TagDto[]>(filter.tags);

    const tagsWithToggleState = useMemo(() => {
        return allTags.map(tag => ({
            ...tag,
            toggled: filterTags.some(({ id }) => id === tag.id)
        }));
    }, [allTags, filterTags]);

    const toggleTag = useCallback(async (selectedTag: TagWithToggleState) => {
        if (selectedTag.toggled) {
            setFilterTags(tags => [...tags].filter(tag => tag.id !== selectedTag.id));
        } else {
            setFilterTags(tags => [...tags, selectedTag]);
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
        <PopoverContent
            bg={useColorModeValue('white', 'gray.800')}
            px="2rem"
            pt="2rem"
            pb="1rem"
            mr="3rem"
            width={["100vw", "100vw", "30rem"]}
            rounded="lg"
        >
            <Flex direction="column"  >
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
                    <Button mt="1rem" mr="1rem" onClick={onClose}>Cancel</Button>
                    <Button mt="1rem" onClick={applyFilter} colorScheme="teal">Apply</Button>
                </Flex>
            </Flex>
        </PopoverContent>
    );
};

export const Filter: React.FC = () => {
    const { filter } = useGamesContext();
    const [showMenu, setShowMenu] = useState(false);

    const filterActive = filter.infoSources.length || filter.tags.length;

    return (
        <Flex align="center" height="100%">
            <Popover
                returnFocusOnClose={false}
                isOpen={showMenu}
                onClose={() => setShowMenu(false)}
                placement="bottom"
            >
                <PopoverTrigger>
                    <Button
                        leftIcon={<EditIcon />}
                        colorScheme={filterActive ? "teal" : undefined}
                        variant={filterActive ? "outline" : "ghost"}
                        onClick={() => setShowMenu(true)}
                    >
                        <Text display={["none", "none", "block"]}>Filter</Text>
                    </Button>
                </PopoverTrigger>
                <FilterMenu onClose={() => setShowMenu(false)} />
            </Popover>
        </Flex>
    );
};
