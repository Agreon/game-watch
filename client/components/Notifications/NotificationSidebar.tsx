import React from 'react'
import { Flex, Box, Text, Slide, Button, Kbd } from "@chakra-ui/react";
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { useNotificationContext } from '../../providers/NotificationProvider';
import { Notification } from './Notification';

export const NotificationSidebar = () => {
    const {
        showNotificationSidebar,
        notificationSidebarRef,
        closeNotificationSidebar,
        notifications,
        markNotificationAsRead,
    } = useNotificationContext();

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
                        onClick={closeNotificationSidebar}
                        size="sm"
                        colorScheme='teal'
                        variant='ghost'
                    >
                        Collapse<Kbd ml="0.5rem">Esc</Kbd>
                    </Button>
                </Flex>
                <Box overflowY="auto" height="100%">
                    <Flex direction="column">
                        {notifications.map(notification =>
                            <Notification
                                key={notification.id}
                                notification={notification}
                                markNotificationAsRead={markNotificationAsRead}
                            />
                        )}
                    </Flex>
                </Box>
            </Box>
        </Slide>
    )
}
