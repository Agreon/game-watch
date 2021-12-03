import { Button, useColorModeValue, useColorMode, Text } from '@chakra-ui/react'
import Image from 'next/image'
import githubIconLight from '../assets/github-icon-light.png'
import githubIconDark from '../assets/github-icon-dark.png'
import { Box, Flex } from '@chakra-ui/layout'

export default function Header() {
    const { colorMode, toggleColorMode } = useColorMode()

    return (
        <Flex
            justify={["space-between", "space-between", "center"]}
            align="center"
            position="absolute"
            zIndex="1500"
            bg={useColorModeValue('white', 'gray.800')}
            width="100%"
            padding="1rem"
            boxShadow="lg"
        >
            <Text fontSize="2xl">GameWatch</Text>
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
                            quality={100}
                        />
                    </a>
                </Box>
                <Button onClick={toggleColorMode}>
                    {colorMode === "light" ? "Darker" : "Lighter"}
                </Button>
            </Flex>
        </Flex>
    )
}