import Head from 'next/head'
import React, { PropsWithChildren, useCallback, useEffect, useRef } from 'react'
import Header from './Header'
import { Flex, Box, useColorModeValue, useDisclosure, Text, Slide, Button, Kbd } from "@chakra-ui/react";
import { Notifications } from './Notifications/Notifications';
import { NotificationProvider } from '../providers/NotificationProvider';
import { ArrowForwardIcon } from '@chakra-ui/icons';

export default function Layout({ children }: PropsWithChildren<{}>) {
    // TODO: Move into provider / component
    const { isOpen: showNotifications, onToggle: toggleNotifications, onClose } = useDisclosure();

    const notificationBarRef = useRef<HTMLDivElement | null>(null);
    // Close on outside click
    const handleClick = useCallback((event) => {
        if (notificationBarRef.current && !notificationBarRef.current.contains(event.target)) {
            onClose();
        }
    }, [onClose]);

    // Close on escape
    const handleKeyDown = useCallback((event) => {
        if (event.keyCode === 27) {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('click', handleClick, true);
        document.addEventListener('keydown', handleKeyDown, true);
        return () => {
            document.removeEventListener('click', handleClick, true);
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [handleClick, handleKeyDown]);

    return (
        <Flex
            direction="column"
            bg={useColorModeValue('gray.100', 'gray.700')}
            height="100vh"
            minHeight="100vh"
        >
            <Head>
                <title>GameWatch</title>
                <meta name="description" content="Overview of game release dates, prices and news" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <NotificationProvider>
                <Header toggleNotifications={toggleNotifications} />
                <Slide
                    direction="right"
                    in={showNotifications}
                    style={{
                        marginTop: "4rem",
                        zIndex: 4
                    }}
                >
                    <Box
                        ref={notificationBarRef}
                        position="absolute"
                        zIndex="4"
                        bg="gray.800"
                        right="0"
                        height="calc(100vh - 4rem)"
                        width="25rem"
                    >
                        <Flex p="0.5rem" align="center" justifyContent="space-between">
                            <Text fontWeight="bold" ml="0.5rem">
                                Notifications
                            </Text>
                            <Button
                                rightIcon={<ArrowForwardIcon />}
                                onClick={onClose}
                                size="sm"
                                colorScheme='teal'
                                variant='ghost'
                            >
                                Collapse<Kbd ml="0.5rem">Esc</Kbd>
                            </Button>
                        </Flex>
                        <Notifications />
                    </Box>
                </Slide>
            </NotificationProvider>
            <Box
                mt="4rem"
                pt="2rem"
                overflowX="hidden"
                overflowY="auto"
            >
                <Flex
                    direction="column"
                    justifyContent="space-between"
                    minHeight="calc(100vh - 4rem)"
                    paddingX={[0, 0, "2rem"]}
                >
                    {children}
                </Flex>
                <Flex
                    justify="center"
                    align="center"
                    width="100%"
                    p="1rem"
                    pt="1.25rem"
                    bg={useColorModeValue('white', 'gray.800')}
                    boxShadow="xl"
                >
                    <a
                        href="https://github.com/Agreon"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Made by <b>Agreon</b>
                    </a>
                </Flex>
            </Box>

        </Flex>
    )
}