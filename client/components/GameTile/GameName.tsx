import { CheckIcon, CloseIcon, EditIcon } from '@chakra-ui/icons';
import {
    ButtonGroup,
    Editable,
    EditableInput,
    EditablePreview,
    Flex,
    IconButton,
    useEditableControls,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

import { useGameContext } from '../../providers/GameProvider';

const EditableControls: React.FC = () => {
    const {
        isEditing,
        getSubmitButtonProps,
        getCancelButtonProps,
        getEditButtonProps,
    } = useEditableControls();

    return isEditing ? (
        <ButtonGroup justifyContent="center" size="sm" ml="1rem">
            <IconButton aria-label="submit" icon={<CheckIcon />} {...getSubmitButtonProps()} />
            <IconButton aria-label="close" icon={<CloseIcon />} {...getCancelButtonProps()} />
        </ButtonGroup>
    ) : (
        <Flex position="absolute" justifyContent="center" top="auto" bottom="auto" right="0">
            <IconButton aria-label="edit" size="sm" icon={<EditIcon />} {...getEditButtonProps()} />
        </Flex>
    );
};

export const GameName: React.FC<{ disableEdit: boolean }> = ({ disableEdit }) => {
    const { game, changeGameName } = useGameContext();
    const [showControls, setShowControls] = useState(false);
    const [value, setValue] = useState(game.name as string);

    useEffect(() => setValue(game.name as string), [game.name]);

    return (
        <Editable
            isDisabled={disableEdit}
            value={value}
            fontSize="2xl"
            isPreviewFocusable={true}
            submitOnBlur={false}
            selectAllOnFocus={false}
            onChange={setValue}
            onSubmit={changeGameName}
            onMouseOver={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <Flex justify="space-between" align="center" position="relative">
                <EditablePreview width="100%" />
                <EditableInput />
                {!disableEdit && showControls && <EditableControls />}
            </Flex>
        </Editable>
    );
};
