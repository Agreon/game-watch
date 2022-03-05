import { Box, Flex, Text } from "@chakra-ui/layout";
import dayjs from "dayjs";
import { NotificationDto, NotificationType } from "@game-watch/shared";
import { SourceTypeLogoSmall } from "../InfoSource/SourceTypeLogo";
import { IconButton, Tooltip } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import React, { useCallback, useMemo } from "react";
import { useAction } from "../../util/useAction";
import { LoadingSpinner } from "../LoadingSpinner";

const NotificationTypeNames: Record<NotificationType, string> = {
    [NotificationType.NewStoreEntry]: "New store entry",
    [NotificationType.ReleaseDateChanged]: "New release date",
    [NotificationType.GameReleased]: "Game released",
    [NotificationType.GameReduced]: "Game reduced",
    [NotificationType.NewMetacriticRating]: "Game rated",
}

function isNotificationOfType<T extends NotificationType, TValue extends NotificationType>(
    notification: NotificationDto<NotificationType>,
    type: TValue
): notification is NotificationDto<Extract<T, TValue>> {
    return notification.type === type;
}

const getNotificationText = (notification: NotificationDto) => {
    const { game } = notification;

    const gameName = <Text fontWeight="bold" display="inline">{game.name || game.search}</Text>;

    if (isNotificationOfType(notification, NotificationType.GameReduced)) {
        const { final, initial } = notification.data;
        return <>{gameName} {`was reduced from ${initial}€ to ${final}€!`}</>;
    }

    if (isNotificationOfType(notification, NotificationType.ReleaseDateChanged)) {
        const formattedDate = dayjs(notification.data.releaseDate).format("DD. MMM. YYYY")
        return <>{gameName} {`will be released on ${formattedDate}!`}</>;
    }

    switch (notification.type) {
        case NotificationType.NewStoreEntry:
            return <>{gameName} was added to the store!</>;
        case NotificationType.GameReleased:
            return <>{gameName} will be available today!</>;
        case NotificationType.NewMetacriticRating:
            return <>{gameName} received a rating!</>;
        default:
            return <>Unknown Notification</>;
    }
}

const NotificationComponent: React.FC<{
    notification: NotificationDto,
    markNotificationAsRead: (id: string) => Promise<void>
}> = ({ notification, markNotificationAsRead }) => {
    const { loading, execute: markAsRead } = useAction(markNotificationAsRead)

    const notificationText = useMemo(() => getNotificationText(notification), [notification]);

    const onMarkAsRead = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        markAsRead(notification.id);
    }, [markAsRead, notification.id])

    return (
        <Box
            position="relative"
            mb="0.5rem"
            mx="0.5rem"
            rounded="lg"
        >
            <Flex
                direction="column"
                p="1rem"
                bg={'gray.700'}
            >
                <Flex align="center" pb="1rem">
                    <Box mr="0.5rem">
                        {SourceTypeLogoSmall[notification.infoSource.type]}
                    </Box>
                    <Tooltip label={dayjs(notification.createdAt).format("DD.MM. HH:mm")} placement="top">
                        <Text fontSize="lg" fontWeight="bold">
                            {NotificationTypeNames[notification.type]}
                        </Text>
                    </Tooltip>
                </Flex>
                <Box>
                    {notificationText}
                </Box>
            </Flex>
            <Box position="absolute" right="0.5rem" top="0.5rem">
                <IconButton
                    icon={<CheckCircleIcon />}
                    onClick={onMarkAsRead}
                    size="sm"
                    variant="ghost"
                    aria-label='Delete'
                />
            </Box>
            {loading && <LoadingSpinner size="md" />}
        </Box>
    )
}

export const Notification = React.memo(NotificationComponent);
