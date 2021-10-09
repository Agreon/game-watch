import { Button, useColorModeValue, useColorMode, Text } from '@chakra-ui/react'
import Image from 'next/image'
import githubIconLight from '../assets/github-icon-light.png'
import githubIconDark from '../assets/github-icon-dark.png'
import { Box, Flex } from '@chakra-ui/layout'

export default function Header() {
    const { colorMode, toggleColorMode } = useColorMode()

    return (
        <Flex
            justify="center"
            align="center"
            position="absolute"
            zIndex="2"
            bg={useColorModeValue('white', 'gray.800')}
            width="100%"
            padding="1rem"
            boxShadow="lg"
        >
            <Text fontSize="2xl">GameView</Text>
            <Flex
                align="center"
                position="absolute"
                right="0"
                mr="1rem"
            >
                <Box mr="1rem" mt="0.25rem">
                    <a
                        href="https://github.com/Agreon/game-watch"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            src={colorMode === "light" ? githubIconDark : githubIconLight}
                            alt="Github"
                            width={32}
                            height={32}
                        />
                    </a>
                </Box>
                <Button onClick={toggleColorMode}>
                    Toggle {colorMode === "light" ? "Dark" : "Light"}
                </Button>
            </Flex>
        </Flex>
    )
}