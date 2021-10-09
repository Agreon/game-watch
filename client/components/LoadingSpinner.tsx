import { Flex } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/react";

export const LoadingSpinner = () => (
    <Flex
        position="absolute"
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
        zIndex="1"
        backgroundColor="rgba(186, 186, 186, 0.21)"
    >
        <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
        />
    </Flex>
)