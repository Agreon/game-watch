import { QuestionOutlineIcon } from '@chakra-ui/icons';
import { Flex, Text, Tooltip } from '@chakra-ui/react';

export const ResolveError: React.FC = () => {
    return (
        <Tooltip
            placement='top'
            style={{
                fontSize: '1.5rem'
            }}
            bg="gray.700"
            color="white"
            fontSize="medium"
            label={
                'There was an error checking the source. Please make sure the game still exists in the store and retry'
                + ' the sync manually. Otherwise, worry not. The team is already notified and will fix the issue'
            }
        >
            <Flex align="baseline" cursor="pointer">
                <Text fontSize="lg" color="tomato" mr="0.5rem">
                    Resolve Error
                </Text>
                <QuestionOutlineIcon color="tomato" pt="0.1rem" />
            </Flex>
        </Tooltip>
    );
};
