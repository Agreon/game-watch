import { Box, Flex } from "@chakra-ui/layout";
import React, { useState } from "react";
import { Tag, TagLabel, TagLeftIcon, IconButton } from "@chakra-ui/react";
import { AddIcon, EditIcon } from "@chakra-ui/icons";
import { useGameContext } from "../../providers/GameProvider";

export const GameTagList: React.FC<{ onEdit: () => void }> = ({ onEdit }) => {
    const { tags, loading, game } = useGameContext();
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
                {tags.map(tag => (
                    <Tag
                        key={tag.id}
                        colorScheme={tag.color}
                        ml="0.5rem"
                        mt="0.5rem"
                    >
                        {tag.name}
                    </Tag>
                ))}
            </Box>
            {!loading && !game.syncing &&
                <Flex align="center" position="absolute" right="0" top="0" height="100%">
                    {tags.length === 0 ? (
                    <Tag onClick={onEdit} colorScheme="teal" cursor="pointer">
                            <TagLeftIcon boxSize="12px" as={AddIcon} />
                            <TagLabel>Add Tags</TagLabel>
                    </Tag>
                    ) : (
                        showEdit && <IconButton aria-label="edit" size="sm" icon={<EditIcon />} onClick={onEdit} />
                    )}
                </Flex>
            }
        </Flex>
    )
}