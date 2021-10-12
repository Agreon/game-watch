import React, { useCallback, useEffect, useMemo, useState } from "react"
import { ButtonGroup, Editable, EditableInput, EditablePreview, Flex, IconButton, useEditableControls } from "@chakra-ui/react"
import { CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons"

const EditableControls: React.FC = () => {
    const {
        isEditing,
        getSubmitButtonProps,
        getCancelButtonProps,
        getEditButtonProps,
    } = useEditableControls()

    return (
        isEditing ? (
            <ButtonGroup justifyContent="center" size="sm" ml="1rem">
                <IconButton aria-label="submit" icon={<CheckIcon />} {...getSubmitButtonProps()} />
                <IconButton aria-label="close" icon={<CloseIcon />} {...getCancelButtonProps()} />
            </ButtonGroup>
        ) : (
            <Flex justifyContent="center">
                <IconButton aria-label="edit" size="sm" icon={<EditIcon />} {...getEditButtonProps()} />
            </Flex>
        )
    )
}

export const GameName: React.FC<{ name: string, onChange: (value: string) => void }> = ({ name, onChange }) => {
    const [showControls, setShowControls] = useState(false);
    const [value, setValue] = useState(name);

    useEffect(() => {
        setValue(name);
    }, [name])

    return (
        <Editable
            value={value}
            fontSize="2xl"
            isPreviewFocusable={true}
            submitOnBlur={false}
            selectAllOnFocus={false}
            onChange={setValue}
            onSubmit={onChange}
            onMouseOver={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <Flex justify="space-between" align="center">
                <EditablePreview width="100%" />
                <EditableInput />
                {showControls && <EditableControls />}
            </Flex>
        </Editable>
    )
}