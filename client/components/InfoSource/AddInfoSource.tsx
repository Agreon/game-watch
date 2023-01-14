import { Box, Button, Flex, Input, Select } from '@chakra-ui/react';
import { InfoSourceType, InfoSourceTypeNames } from '@game-watch/shared';
import { useState } from 'react';

import { useGameContext } from '../../providers/GameProvider';
import { useUserContext } from '../../providers/UserProvider';
import { SourceUrlPlaceholder } from '../../util/source-url-placeholder';
import { useAction } from '../../util/useAction';

export const AddInfoSource: React.FC<{
    scheme: 'primary' | 'secondary'
    onSuccess?: () => void
}> = ({ onSuccess, scheme }) => {
    const { user: { interestedInSources, country: userCountry } } = useUserContext();
    const { addInfoSource, activeInfoSources } = useGameContext();

    const availableInfoSources = interestedInSources.filter(
        type => activeInfoSources.find(source => source.type === type) === undefined
    );

    const [type, setType] = useState(availableInfoSources[0] ?? '');
    const [url, setUrl] = useState('');

    const { loading, execute: onAdd } = useAction(addInfoSource, {
        onSuccess: () => {
            setUrl('');
            if (onSuccess) onSuccess();
        }
    });

    return (
        <Flex direction={['column', 'row']}>
            <Box mr="1rem" mb={['0.5rem', 0]}>
                <Select
                    pt="0.125rem"
                    onChange={event => setType(event.target.value as InfoSourceType)}
                >
                    {availableInfoSources.map(type => (
                        <option key={type} value={type}>{InfoSourceTypeNames[type]}</option>
                    ))}
                </Select>
            </Box>
            <Box flex="1" mr="1rem" mb={['0.5rem', 0]}>
                <Input
                    value={url}
                    disabled={loading}
                    placeholder={SourceUrlPlaceholder(type, userCountry)}
                    onChange={event => setUrl(event.target.value)}
                />
            </Box>
            <Box>
                <Button
                    onClick={() => onAdd({ type, url })}
                    disabled={loading || !url.length}
                    isLoading={loading}
                    colorScheme={scheme == 'primary' ? 'teal' : undefined}
                >
                    Add
                </Button>
            </Box>
        </Flex>
    );
};
