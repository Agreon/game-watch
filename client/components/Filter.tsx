import { EditIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Switch,
    Text,
    useDisclosure,
} from '@chakra-ui/react';
import { Tag as ChakraTag } from '@chakra-ui/react';
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
    const [showOnlyAlreadyReleased, setShowOnlyAlreadyReleased] = useState(
        filter.showOnlyAlreadyReleased
    );
    const [showEarlyAccessGames, setShowEarlyAccessGames] = useState(
        filter.showEarlyAccessGames
    );

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
            tags: filterTags,
            showOnlyAlreadyReleased,
            showEarlyAccessGames,
        });
        onClose();
    }, [onClose, filterTags, filterInfoSources, showOnlyAlreadyReleased, showEarlyAccessGames, setFilter]);

    return (
        <Box>
            <Flex direction="column">
                <Box mb="1rem">
                    <FormControl display='flex' alignItems='center'>
                        <Switch
                            id='show-only-released-games-switch'
                            checked={showOnlyAlreadyReleased}
                            colorScheme="teal"
                            defaultChecked={filter.showOnlyAlreadyReleased}
                            onChange={e => setShowOnlyAlreadyReleased(e.target.checked)}
                        />
                        <FormLabel
                            htmlFor='show-only-released-games-switch'
                            mt="0.75rem"
                            ml="1rem"
                            cursor="pointer"
                        >
                            Show only released games
                        </FormLabel>
                    </FormControl>
                    {showOnlyAlreadyReleased &&
                        <FormControl display='flex' alignItems='center'>
                            <Switch
                                id='show-early-access-games-switch'
                                checked={showEarlyAccessGames}
                                colorScheme="teal"
                                defaultChecked={filter.showEarlyAccessGames}
                                onChange={e => setShowEarlyAccessGames(e.target.checked)}
                            />
                            <FormLabel
                                htmlFor='show-early-access-games-switch'
                                mt="0.75rem"
                                ml="1rem"
                                cursor="pointer"
                            >
                                Include Early Access Games
                            </FormLabel>
                        </FormControl>
                    }
                </Box>
                <Box>
                    <Text fontSize="lg" fontWeight="bold" mb="0.5rem">InfoSources</Text>
                    <InfoSourceFilter
                        availableInfoSources={availableInfoSources}
                        filterInfoSources={filterInfoSources}
                        setFilterInfoSources={setFilterInfoSources}
                    />
                </Box>
                {tagsWithToggleState.length !== 0 &&
                    <Box mt="1rem">
                        <Text fontSize="lg" fontWeight="bold" mb="0.5rem">Tags</Text>
                        <Flex flexWrap="wrap">
                            {tagsWithToggleState.map(tag => (
                                <ChakraTag
                                    key={tag.id}
                                    onClick={() => toggleTag(tag)}
                                    variant={tag.toggled ? 'subtle' : 'outline'}
                                    colorScheme={tag.toggled ? tag.color : 'white'}
                                    cursor="pointer"
                                    mx="0.5rem"
                                    my="0.25rem"
                                >
                                    {tag.name}
                                </ChakraTag>
                            ))}
                        </Flex>
                    </Box>
                }

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

    const filterIsActive = (
        filter.infoSources.length
        || filter.tags.length
        || filter.showOnlyAlreadyReleased
    );

    return (
        <Flex align="center" height="100%">
            <Button
                leftIcon={<EditIcon />}
                colorScheme={filterIsActive ? 'teal' : undefined}
                variant={filterIsActive ? 'outline' : 'ghost'}
                onClick={onOpen}
            >
                <Text display={['none', 'none', 'block']}>Filter</Text>
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
