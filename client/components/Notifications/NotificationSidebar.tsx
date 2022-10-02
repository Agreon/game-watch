import { ArrowForwardIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Kbd, Slide, Text } from '@chakra-ui/react';
import { NotificationDto } from '@game-watch/shared';
import React, { useCallback } from 'react';

import { useNotificationContext } from '../../providers/NotificationProvider';
import { Notification } from './Notification';
import { useAction } from '../../util/useAction';

export const NotificationSidebar = () => {
    const {
        notifications,
        showNotificationSidebar,
        notificationSidebarRef,
        closeNotificationSidebar,
        markNotificationAsRead,
        markAllNotificationsAsRead,
    } = useNotificationContext();

    const { loading, execute: markAllAsRead } = useAction(markAllNotificationsAsRead);

    const onClick = useCallback((notification: NotificationDto) => {
        const scrollContainer = document.getElementById('scrollContainer');
        const gameTile = document.getElementById(notification.game.id);
        if (!scrollContainer || !gameTile) {
            return;
        }

        closeNotificationSidebar();
        scrollContainer.scrollTo({
            top: gameTile.offsetTop - scrollContainer.offsetTop - 50,
            behavior: 'smooth'
        });
    }, [closeNotificationSidebar]);

    return (
        <Slide
            direction="right"
            in={showNotificationSidebar}
            style={{
                marginTop: '4rem',
                zIndex: 4
            }}
        >
            <Box
                ref={notificationSidebarRef}
                position="absolute"
                left={[showNotificationSidebar ? 'unset' : 0, 'unset']}
                zIndex="4"
                bg="gray.800"
                right="0"
                height="calc(100vh - 4rem)"
                width={['100%', '100%', '25rem']}
            >
                <Flex p="0.5rem" height="3rem" align="center" justifyContent="space-between">
                    <Text fontWeight="bold" fontSize="large" ml="0.5rem">
                        Notifications
                    </Text>
                    <Button
                        rightIcon={<ArrowForwardIcon />}
                        onClick={closeNotificationSidebar}
                        size="sm"
                        colorScheme='teal'
                        variant='ghost'
                    >
                        Collapse<Kbd ml="0.5rem" display={['none', 'none', 'block']}>Esc</Kbd>
                    </Button>
                </Flex>
                {notifications.length > 0
                    && <Flex p="1rem" pt="0rem" px="1.5rem" align="center" justifyContent="center">
                        <Button
                            onClick={markAllAsRead}
                            width="100%"
                            size="sm"
                            colorScheme='teal'
                            variant='outline'
                            rightIcon={<CheckCircleIcon />}
                            isLoading={loading}
                        >
                            Mark all as read
                        </Button>
                    </Flex>
                }
                <Box overflowY="auto" height="calc(100vh - 7rem)">
                    <Flex direction="column">
                        {notifications.map(notification =>
                            <Box
                                key={notification.id}
                                onClick={() => onClick(notification)}
                                cursor="pointer"
                            >
                                <Notification
                                    notification={notification}
                                    markNotificationAsRead={markNotificationAsRead}
                                />
                            </Box>

                        )}
                        {!notifications.length
                            && <Box mt="3rem" display="flex" justifyContent="center">
                                No notifications available yet
                            </Box>
                        }
                    </Flex>
                </Box>
            </Box>
        </Slide>
    );
};
