import { EditIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { Tag as ChakraTag } from "@chakra-ui/react";
import { InfoSourceType, SupportedCountries, TagDto } from '@game-watch/shared';
import React, { useCallback, useMemo, useState } from 'react';

import { INFO_SOURCE_PRIORITY } from '../providers/GameProvider';
import { useGamesContext } from '../providers/GamesProvider';
import { useTagContext } from '../providers/TagProvider';
import { useUserContext } from '../providers/UserProvider';
import { TagWithToggleState } from './GameTags/EditGameTags';
import { InfoSourceFilter } from './InfoSourceFilter';

export const FilterMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { user } = useUserContext();
    const { tags: allTags } = useTagContext();
    const { filter, setFilter } = useGamesContext();
    const [
        filterInfoSources,
        setFilterInfoSources
    ] = useState<InfoSourceType[]>(filter.infoSources);
    const [filterTags, setFilterTags] = useState<TagDto[]>(filter.tags);

    const availableInfoSources = useMemo(
        () => INFO_SOURCE_PRIORITY.filter(
            type => SupportedCountries[type].includes(user.country)
        ),
        [user.country]
    );

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
        <Box>
            <Flex direction="column">
                <Box>
                    <Text fontSize="lg" fontWeight="bold" mb="0.5rem">InfoSources</Text>
                    <InfoSourceFilter
                        availableInfoSources={availableInfoSources}
                        filterInfoSources={filterInfoSources}
                        setFilterInfoSources={setFilterInfoSources}
                    />
                </Box>
                <Box mt="1rem">
                    <Text fontSize="lg" fontWeight="bold" mb="0.5rem">Tags</Text>
                    <Flex flexWrap="wrap">
                        {tagsWithToggleState.map(tag => (
                            <ChakraTag
                                key={tag.id}
                                onClick={() => toggleTag(tag)}
                                variant={tag.toggled ? "subtle" : "outline"}
                                colorScheme={tag.toggled ? tag.color : "whiteAlpha"}
                                cursor="pointer"
                                mx="0.5rem"
                                my="0.25rem"
                            >
                                {tag.name}
                            </ChakraTag>
                        ))}
                    </Flex>
                </Box>
                <Flex justify="end">
                    <Button mt="1rem" mr="1rem" onClick={onClose}>Cancel</Button>
                    <Button mt="1rem" onClick={applyFilter} colorScheme="teal">Apply</Button>
                </Flex>
            </Flex>
        </Box>
    );
};

export const Filter: React.FC = () => {
    const { filter } = useGamesContext();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const filterActive = filter.infoSources.length || filter.tags.length;

    return (
        <Flex align="center" height="100%">
            <Button
                leftIcon={<EditIcon />}
                colorScheme={filterActive ? "teal" : undefined}
                variant={filterActive ? "outline" : "ghost"}
                onClick={onOpen}
            >
                <Text display={["none", "none", "block"]}>Filter</Text>
            </Button>
            <Modal
                size="xl"
                isOpen={isOpen}
                onClose={onClose}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Filter</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FilterMenu onClose={onClose} />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Flex>
    );
};
