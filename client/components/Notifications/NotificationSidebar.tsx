import React, { useCallback } from 'react'
import { Flex, Box, Text, Slide, Button, Kbd } from "@chakra-ui/react";
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { useNotificationContext } from '../../providers/NotificationProvider';
import { Notification } from './Notification';
import { NotificationDto } from '@game-watch/shared';

export const NotificationSidebar = () => {
    const {
        showNotificationSidebar,
        notificationSidebarRef,
        closeNotificationSidebar,
        notifications,
        markNotificationAsRead,
    } = useNotificationContext();

    const onClick = useCallback((notification: NotificationDto) => {
        const scrollContainer = document.getElementById("scrollContainer");
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
                marginTop: "4rem",
                zIndex: 4
            }}
        >
            <Box
                ref={notificationSidebarRef}
                position="absolute"
                left={[showNotificationSidebar ? "unset" : 0, "unset"]}
                zIndex="4"
                bg="gray.800"
                right="0"
                height="calc(100vh - 4rem)"
                width={["100%", "100%", "25rem"]}
            >
                <Flex p="0.5rem" align="center" justifyContent="space-between">
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
                        Collapse<Kbd ml="0.5rem" display={["none", "none", "block"]}>Esc</Kbd>
                    </Button>
                </Flex>
                <Box overflowY="auto" height="100%">
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
                        {!notifications.length && <Box mt="3rem" display="flex" justifyContent="center">No notifications available yet</Box>}
                    </Flex>
                </Box>
            </Box>
        </Slide>
    )
}
