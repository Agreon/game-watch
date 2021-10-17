import {
    IconButton,
    Menu,
    MenuList,
    MenuButton,
    MenuItem
} from "@chakra-ui/react";
import { useCallback } from "react";
import { InfoSource } from "../../providers/GamesProvider"
import { ChevronDownIcon, DownloadIcon, ViewOffIcon } from '@chakra-ui/icons'
import { useInfoSourceContext } from "../../providers/InfoSourceProvider";

/**
 * TODO:
 * - Edit
 */
export const InfoSourceOptions: React.FC<{ source: InfoSource }> = ({ source }) => {
    const { disableInfoSource, syncInfoSource } = useInfoSourceContext();

    const onRemove = useCallback(() => disableInfoSource(source), [source, disableInfoSource]);
    const onSync = useCallback(() => syncInfoSource(source), [source, syncInfoSource]);

    return (
        <Menu>
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