import { Box, Flex, Link, Text } from '@chakra-ui/react';
import { NextPage } from 'next';

const Legal: NextPage = () => {
    return (
        <Box>
            <Text fontSize="2xl" textAlign="center" mb="2rem">Imprint</Text>

            <Text mb="1rem" fontSize="xl">
                This website was made and is maintained by:
            </Text>

            <p>Daniel Huth<br />
                Im Langgarten 1<br />
                63589 Linsengericht</p>

            <Text fontSize="xl" mt="1rem">Contact</Text>
            <Flex>
                Mail: <Text mx="0.5rem">huth </Text>
                <Text mr="0.5rem">at </Text>
                <Text mr="0.5rem">duck </Text><Text mr="0.5rem">dot </Text><Text>com</Text>
            </Flex>
            <Text mt="1rem">
                If you have any questions or issues to report, feel free to do so on{' '}
                <Link
                    href="https://github.com/agreon/game-watch/issues"
                    fontWeight="bold"
                    target="_blank"
                >
                    Github
                </Link>
            </Text>
        </Box>
    );
};

export default Legal;
