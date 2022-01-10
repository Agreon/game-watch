import Head from 'next/head'
import React, { PropsWithChildren } from 'react'
import Header from './Header'
import { Flex, Box, useColorModeValue, useDisclosure, Fade, SlideFade, Slide } from "@chakra-ui/react";
import { Notifications } from './Notifications/Notifications';
import { NotificationProvider } from '../providers/NotificationProvider';

export default function Layout({ children }: PropsWithChildren<{}>) {
    // TODO: Move into provider?
    const { isOpen: showNotifications, onToggle: toggleNotifications } = useDisclosure();

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
                        position="absolute"
                        zIndex="4"
                        bg="black"
                        right="0"
                        height="calc(100vh - 4rem)"
                        width="25rem"
                    >
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