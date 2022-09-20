import { Flex, Spinner, ThemeTypings } from '@chakra-ui/react';

export const LoadingSpinner: React.FC<{
    size: ThemeTypings['components']['Spinner']['sizes']
    disableBackdrop?: boolean
}> = ({ size, disableBackdrop }) => (
    <Flex
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        justify="center"
        align="center"
        zIndex="1"
        backgroundColor={disableBackdrop ? undefined : 'rgba(186, 186, 186, 0.21)'}
    >
        <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size={size}
        />
    </Flex>
);
