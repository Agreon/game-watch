import { BellIcon, WarningIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, IconButton, Text, useBreakpointValue, useColorMode, useColorModeValue, useDisclosure } from '@chakra-ui/react';
import { UserState } from "@game-watch/shared";
import Image from 'next/image';
import React from "react";

import githubIconDark from '../assets/github-icon-dark.png';
import githubIconLight from '../assets/github-icon-light.png';
import { useNotificationContext } from '../providers/NotificationProvider';
import { useUserContext } from "../providers/UserProvider";
import { AuthModal } from "./Auth/AuthModal";

export default function Header() {
    const { user, logoutUser } = useUserContext();
    const { notifications, openNotificationSidebar } = useNotificationContext();
    const { colorMode } = useColorMode();

    const { isOpen: showAuthModal, onOpen: openAuthModal, onClose: closeAuthModal } = useDisclosure();

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
            <Text fontSize="2xl">{useBreakpointValue(["GW", "GameWatch"])}</Text>
            <Flex
                align="center"
                position="absolute"
                right="0"
                mr="1rem"
            >
                {user.state === UserState.Trial ?
                    <Box mr="1.5rem">
                        <AuthModal
                            show={showAuthModal}
                            onClose={closeAuthModal}
                        />
                        <Button
                            aria-label="save-data"
                            leftIcon={<WarningIcon />}
                            onClick={openAuthModal}
                            variant="outline"
                            colorScheme="orange"
                        >
                            Save Data
                        </Button>
                    </Box>
                    : <Flex align="center" mr="1.5rem">
                        <Text display={["none", "none", "block"]}>Hey {user.username}!</Text>
                        <Button
                            ml="0.5rem"
                            aria-label="logout"
                            size="sm"
                            onClick={logoutUser}
                            variant="outline"
                            colorScheme="teal"
                        >
                            Logout
                        </Button>
                    </Flex>
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
    );
}
