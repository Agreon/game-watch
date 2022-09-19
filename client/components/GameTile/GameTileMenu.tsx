import { DeleteIcon, DownloadIcon, SettingsIcon } from '@chakra-ui/icons';
import {
    AlertDialogCloseButton,
    Button,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
} from '@chakra-ui/react';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
} from '@chakra-ui/react';
import React, { useCallback, useRef, useState } from 'react';

export interface GameTileMenuProps {
    gameName: string
    highlight: boolean
    onSync: () => Promise<void>
    onDelete: () => Promise<void>
}

/**
 * - TODO: Submit btn color
 * TODO: animated entry of button
 */
const GameTileMenuComponent: React.FC<GameTileMenuProps> = ({
    gameName,
    onSync,
    onDelete,
    highlight,
}) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const cancelRef = useRef(null);

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
                        <AlertDialogCloseButton />

                        <AlertDialogBody>
                            Are you sure?
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button onClick={() => setDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                variant="solid"
                                onClick={onDeleteSubmit}
                                ml={3}
                            >
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
            {highlight &&
                <Menu>
                    <MenuButton
                        as={IconButton}
                        aria-label="Options"
                        icon={<SettingsIcon />}
                        variant="ghost"
                        color="white"
                        size="md"
                        _focus={{
                            boxShadow: 'none'
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
            }
        </>
    );
};

export const GameTileMenu = React.memo(GameTileMenuComponent);
