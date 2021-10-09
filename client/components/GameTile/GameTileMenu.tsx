import { IconButton, Menu, MenuList, MenuButton, MenuItem, Button } from "@chakra-ui/react";
import { SettingsIcon, DeleteIcon, DownloadIcon } from '@chakra-ui/icons'
import React, { useCallback, useRef, useState } from "react";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from "@chakra-ui/react"

export interface GameTileMenuProps {
    gameName: string
    onSync: () => Promise<void>
    onDelete: () => Promise<void>
}

/**
 * TODO:
 * - Submit btn color
 */
export const GameTileMenu: React.FC<GameTileMenuProps> = ({ gameName, onSync, onDelete }) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const cancelRef = useRef(null)

    const onDeleteSubmit = useCallback(async () => {
        setDeleteDialogOpen(false);
        await onDelete();
    }, [setDeleteDialogOpen, onDelete]);

    return (
        <>
            <AlertDialog
                isOpen={deleteDialogOpen}
                leastDestructiveRef={cancelRef}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete {gameName}
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure?
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button onClick={() => setDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={onDeleteSubmit} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
            <Menu>
                <MenuButton
                    as={IconButton}
                    aria-label="Options"
                    icon={<SettingsIcon />}
                    variant="ghost"
                    size="lg"
                    _focus={{
                        boxShadow: "none"
                    }}
                />
                <MenuList>
                    <MenuItem icon={<DownloadIcon />} onClick={onSync}>
                        Sync
                    </MenuItem>
                    <MenuItem icon={<DeleteIcon />} onClick={() => setDeleteDialogOpen(true)}>
                        Delete
                    </MenuItem>
                </MenuList>
            </Menu>
        </>
    )
}