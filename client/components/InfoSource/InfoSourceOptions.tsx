import {
    IconButton,
    Menu,
    MenuList,
    MenuButton,
    MenuItem,
    AlertDialogOverlay,
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    Button,
    AlertDialogCloseButton,
    Box
} from "@chakra-ui/react"
import { ChevronDownIcon, DownloadIcon, ViewOffIcon } from '@chakra-ui/icons'
import { useInfoSourceContext } from "../../providers/InfoSourceProvider"
import { useGameContext } from "../../providers/GameProvider"
import { useCallback, useRef, useState } from "react"

export const InfoSourceOptions: React.FC = () => {
    const { loading, game } = useGameContext()
    const { disableInfoSource, syncInfoSource, excludeInfoSource, source } = useInfoSourceContext()

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const cancelRef = useRef(null)

    const onDisableInfoSource = useCallback(async () => {
        setDeleteDialogOpen(false)
        await disableInfoSource()
    }, [disableInfoSource])

    const onKeepSearching = useCallback(async () => {
        setDeleteDialogOpen(false)
        await excludeInfoSource()
    }, [excludeInfoSource])

    return (
        <>
            <AlertDialog
                size="lg"
                isOpen={deleteDialogOpen}
                leastDestructiveRef={cancelRef}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Remove {source.type} InfoSource from {game.name}
                        </AlertDialogHeader>
                        <AlertDialogCloseButton />

                        <AlertDialogBody>
                            Do you not want to be bothered again or should we keep searching for alternatives?
                        </AlertDialogBody>

                        <AlertDialogFooter display="flex" justifyContent="space-between">
                            <Box>
                                <Button onClick={() => setDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                            </Box>
                            <Box>
                                <Button colorScheme="red" variant="solid" onClick={onDisableInfoSource} ml={3}>
                                    Remove
                                </Button>
                                <Button colorScheme="teal" variant="solid" onClick={onKeepSearching} ml={3}>
                                    Keep Searching
                                </Button>
                            </Box>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        <Menu
            isOpen={(!loading && !game.syncing) ? undefined : false}
        >
            <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<ChevronDownIcon />}
                variant="outline"
                size="sm"
            />
            <MenuList>
                <MenuItem icon={<DownloadIcon />} onClick={syncInfoSource}>
                    Sync
                </MenuItem>
                    <MenuItem icon={<ViewOffIcon />} onClick={() => setDeleteDialogOpen(true)}>
                    Remove
                </MenuItem>
            </MenuList>
        </Menu>
        </>
    )
}
