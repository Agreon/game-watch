import { Box, Button, Flex, Input } from '@chakra-ui/react';
import { InfoSourceType } from '@game-watch/shared';
import {
    chakraComponents,
    OptionBase,
    OptionProps,
    Select,
    SingleValueProps,
} from 'chakra-react-select';
import { useMemo, useState } from 'react';

import { useGameContext } from '../../providers/GameProvider';
import { useUserContext } from '../../providers/UserProvider';
import { SourceUrlPlaceholder } from '../../util/source-url-placeholder';
import { useAction } from '../../util/useAction';
import { SourceTypeLogo } from './SourceTypeLogo';

interface InfoSourceOption extends OptionBase {
    value: InfoSourceType;
}

const customComponents = {
    Option: ({ ...props }: OptionProps<InfoSourceOption>) => (
        <chakraComponents.Option {...props}>
            {SourceTypeLogo[props.data.value]}
        </chakraComponents.Option>
    ),
    SingleValue: ({ ...props }: SingleValueProps<InfoSourceOption>) => (
        <chakraComponents.SingleValue {...props}>
            {SourceTypeLogo[props.data.value]}
        </chakraComponents.SingleValue>
    )
};

export const AddInfoSource: React.FC<{
    scheme: 'primary' | 'secondary'
    onSuccess?: () => void
}> = ({ onSuccess, scheme }) => {
    const { user: { interestedInSources, country: userCountry } } = useUserContext();
    const { addInfoSource, activeInfoSources } = useGameContext();

    const availableInfoSources = interestedInSources.filter(
        type => activeInfoSources.find(source => source.type === type) === undefined
    );

    const sourceOptions = useMemo(
        () => availableInfoSources.map(type => ({ value: type, })),
        [availableInfoSources]
    );

    const [type, setType] = useState(sourceOptions[0]);
    const [url, setUrl] = useState('');

    const { loading, execute: onAdd } = useAction(addInfoSource, {
        onSuccess: () => {
            setUrl('');
            if (onSuccess) onSuccess();
        }
    });

    return (
        <Flex direction={['column', 'row']}>
            <Box mr="1rem" mb={['0.5rem', 0]} minWidth="13rem">
                <Select<InfoSourceOption>
                    isSearchable={false}
                    options={sourceOptions}
                    components={customComponents}
                    value={type}
                    onChange={value => value && setType(value)}
                />
            </Box>
            <Box flex="1" mr="1rem" mb={['0.5rem', 0]}>
                <Input
                    value={url}
                    disabled={loading}
                    placeholder={SourceUrlPlaceholder(type.value, userCountry)}
                    onChange={event => setUrl(event.target.value)}
                />
            </Box>
            <Box>
                <Button
                    onClick={() => onAdd({ type: type.value, url })}
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
