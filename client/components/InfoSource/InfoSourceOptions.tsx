import {
    IconButton,
    Menu,
    MenuList,
    MenuButton,
    MenuItem
} from "@chakra-ui/react";
import { ChevronDownIcon, DownloadIcon, ViewOffIcon } from '@chakra-ui/icons'
import { useInfoSourceContext } from "../../providers/InfoSourceProvider";
import { useGameContext } from "../../providers/GameProvider";

export const InfoSourceOptions: React.FC = () => {
    const { loading, game } = useGameContext();
    const { disableInfoSource, syncInfoSource } = useInfoSourceContext();

    return (
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
                <MenuItem icon={<ViewOffIcon />} onClick={disableInfoSource}>
                    Remove
                </MenuItem>
            </MenuList>
        </Menu>
    )
}