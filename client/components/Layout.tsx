import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import Head from 'next/head';
import Link from 'next/link';
import React, { PropsWithChildren } from 'react';

import Header from './Header';
import { NotificationSidebar } from './Notifications/NotificationSidebar';

export default function Layout({ children }: PropsWithChildren<unknown>) {
    return (
        <Flex
            direction="column"
            bg={useColorModeValue('gray.100', 'gray.700')}
            height="100vh"
            minHeight="100vh"
        >
            <Head>
                <title>GameWatch</title>
                <meta
                    key="description"
                    name="description"
                    content="Overview of game release dates, prices and news"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <NotificationSidebar />
            <Flex
                id="scrollContainer"
                mt="4rem"
                pt="2rem"
                overflowX="hidden"
                overflowY="auto"
                direction="column"
                height="100%"
            >
                <Flex
                    direction="column"
                    justifyContent="space-between"
                    paddingX={[0, 0, '2rem']}
                    flex="1"
                >
                    {children}
                </Flex>
                <Flex
                    justify="space-between"
                    align="center"
                    width="100%"
                    p="1rem"
                    bg={useColorModeValue('white', 'gray.800')}
                    boxShadow="xl"
                >
                    <Box>
                        <a
                            href="https://github.com/Agreon"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Made by <b>Agreon</b>
                        </a>
                    </Box>
                    <Flex>
                        <Box>
                            <Link href="/imprint" prefetch={false}>Imprint</Link>
                        </Box>
                        <Box ml="1rem">
                            <Link href="/note" prefetch={false}>Privacy Policy</Link>
                        </Box>

                        <Box ml="1rem">
                            <Link href="/tos" prefetch={false}>Terms of Service</Link>
                        </Box>
                    </Flex>
                </Flex>
            </Flex>

        </Flex>
    );
}
