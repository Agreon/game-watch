import {
    IconButton,
    Menu,
    MenuList,
    MenuButton,
    MenuItem
} from "@chakra-ui/react";
import { useCallback } from "react";
import { ChevronDownIcon, DownloadIcon, ViewOffIcon } from '@chakra-ui/icons'
import { useInfoSourceContext } from "../../providers/InfoSourceProvider";
import { useGameContext } from "../../providers/GameProvider";

export const InfoSourceOptions: React.FC = () => {
    const { loading, game } = useGameContext();
    const { disableInfoSource, syncInfoSource } = useInfoSourceContext();

    const onRemove = useCallback(() => disableInfoSource(), [disableInfoSource]);
    const onSync = useCallback(() => syncInfoSource(), [syncInfoSource]);

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
                <MenuItem icon={<DownloadIcon />} onClick={onSync}>
                    Sync
                </MenuItem>
                <MenuItem icon={<ViewOffIcon />} onClick={onRemove}>
                    Remove
                </MenuItem>
            </MenuList>
        </Menu>
    )
}