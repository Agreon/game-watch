import { Box, Flex } from "@chakra-ui/layout";
import React, { useState } from "react";
import { Tag as ChakraTag, TagLabel, TagLeftIcon, IconButton } from "@chakra-ui/react";
import { AddIcon, EditIcon } from "@chakra-ui/icons";
import { Game } from "../../providers/GameProvider";

export const GameTagList: React.FC<{ game: Game, onEdit: () => void }> = ({ game, onEdit }) => {
    const [showEdit, setShowEdit] = useState(false);

    return (
        <Flex
            align="center"
            position="relative"
            minHeight="32px"
            onMouseOver={() => setShowEdit(true)}
            onMouseLeave={() => setShowEdit(false)}
        >
            <Box ml="-0.5rem" mt="-0.5rem">
                {game.tags.map(tag => (
                    <ChakraTag
                        key={tag.id}
                        colorScheme={tag.color}
                        ml="0.5rem"
                        mt="0.5rem"
                    >
                        {tag.name}
                    </ChakraTag>
                ))}
            </Box>
            <Flex align="center" position="absolute" right="0" top="0" height="100%">
                {game.tags.length === 0 ? (
                    <ChakraTag onClick={onEdit} colorScheme="teal" cursor="pointer">
                        <TagLeftIcon boxSize="12px" as={AddIcon} />
                        <TagLabel>Add Tags</TagLabel>
                    </ChakraTag>
                ) : (
                    showEdit && <IconButton aria-label="edit" size="sm" icon={<EditIcon />} onClick={onEdit} />
                )}
            </Flex>
        </Flex>
    )
}