import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { ButtonGroup, Flex, IconButton, Input } from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export const AddTagToGame: React.FC<{
    onSubmit: (value: string) => Promise<void>,
    onAbort: () => void
}> = ({ onSubmit, onAbort }) => {
    // Focus initially
    const inputRef = useRef<HTMLInputElement | null>(null);
    useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);

    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');

    const onCancel = useCallback(() => {
        setName('');
        onAbort();
    }, [onAbort]);

    const onAdd = useCallback(async () => {
        setLoading(true);
        try {
            await onSubmit(name);
            setName('');
        } finally {
            setLoading(false);
        }
    }, [onSubmit, name]);

    const onNameKeyPress = useCallback(async ({ key }: { key: string }) => {
        if (key === 'Enter') {
            onAdd();
        }
    }, [onAdd]);

    return (
        <Flex>
            <Input
                size="sm"
                mr="1rem"
                ref={inputRef}
                value={name}
                disabled={loading}
                onChange={(event) => setName(event.target.value)}
                onKeyPress={onNameKeyPress}
            />
            <ButtonGroup justifyContent="center" size="sm">
                <IconButton
                    aria-label="add"
                    icon={<CheckIcon />}
                    onClick={onAdd}
                    disabled={loading}
                />
                <IconButton
                    aria-label="cancel"
                    icon={<CloseIcon />}
                    onClick={onCancel}
                    disabled={loading}
                />
            </ButtonGroup>
        </Flex>
    );
};
