import { Button, useColorModeValue, useColorMode, Text } from '@chakra-ui/react'
import Image from 'next/image'
import githubIconLight from '../assets/github-icon-light.png'
import githubIconDark from '../assets/github-icon-dark.png'
import { Box, Flex } from '@chakra-ui/layout'
import { useNotificationContext } from '../providers/NotificationProvider'
import { BellIcon } from '@chakra-ui/icons'

export default function Header() {
    const { notifications, openNotificationSidebar } = useNotificationContext();
    const { colorMode } = useColorMode()

    return (
        <Flex
            justify={["space-between", "space-between", "center"]}
            align="center"
            position="absolute"
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
                <Button
                    leftIcon={<BellIcon />}
                    onClick={openNotificationSidebar}
                >
                    <Text mt="0.2rem">Notifications ({notifications.length})</Text>
                </Button>
            </Flex>
        </Flex>
    )
}