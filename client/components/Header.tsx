import React from "react";
import { IconButton, useColorModeValue, useColorMode, Text } from '@chakra-ui/react'
import Image from 'next/image'
import githubIconLight from '../assets/github-icon-light.png'
import githubIconDark from '../assets/github-icon-dark.png'
import { Box, Flex } from '@chakra-ui/layout'
import { useNotificationContext } from '../providers/NotificationProvider'
import { BellIcon } from '@chakra-ui/icons'
import { useUserContext } from "../providers/UserProvider";
import { UserState } from "@game-watch/shared";

export default function Header() {
    const { user } = useUserContext();
    const { notifications, openNotificationSidebar } = useNotificationContext()
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
                {user.state === UserState.Trial &&
                    <Box mr="1rem">
                        Save
                    </Box>
                }
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
                <Box position="relative">
                    <IconButton
                        aria-label="notifications"
                        icon={<BellIcon w={6} h={6} />}
                        onClick={openNotificationSidebar}
                        variant="ghost"
                        _focus={{
                            boxShadow: "none"
                        }}
                    />
                    {notifications.length > 0 &&
                        <Box position="absolute" bg="teal" rounded="3xl" mr="0.25rem" mt="0.1rem" top="0" right="0" width="1rem" height="1rem" display="flex" justifyContent="center" >
                            <Text fontWeight="bold" fontSize="xs">{notifications.length}</Text>
                        </Box>
                    }
                </Box>
            </Flex>
        </Flex>
    )
}