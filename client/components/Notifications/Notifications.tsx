import { Box, Flex, Text } from "@chakra-ui/layout";
import { useNotificationContext } from "../../providers/NotificationProvider";
import dayjs from "dayjs";
import { NotificationDto, NotificationType } from "@game-watch/shared";
import { SourceTypeLogoSmall } from "../InfoSource/SourceTypeLogo";
import { IconButton, useColorModeValue, Tooltip } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";

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

    // TODO: Scroll-To-Game Effect with simple html links?
    const gameName = <Text fontWeight="bold" display="inline">{game.name || game.search}</Text>;

    if (isNotificationOfType(notification, NotificationType.GameReduced)) {
        const { final, initial } = notification.data;
        return <>{gameName} {`was reduced from ${initial}€ to ${final}€!`}</>;
    }

    // TODO: Date needs to be parsed
    // => Maybe just parse the date on incoming data in resolver? => Needs to be done anyway for comparison.
    if (isNotificationOfType(notification, NotificationType.ReleaseDateChanged)) {
        const formattedDate = dayjs(notification.data.releaseDate).format("DD. MMM. YYYY")
        return <>{gameName} {`will be released on (${formattedDate})!`}</>;
    }

    switch (notification.type) {
        case NotificationType.NewStoreEntry:
        case NotificationType.GameReleased:
            return <>{gameName} is now available!</>;
        case NotificationType.NewMetacriticRating:
            return <>{gameName} received a rating!</>;
        default:
            return "Unknown Notification";
    }
}

// TODO: Show small Collapse button?
// TODO: Better distinguish from background
export const Notifications: React.FC<{}> = () => {
    const { notifications, markNotificationAsRead } = useNotificationContext();

    return (
        <Box
            pt="1rem"
            bg={useColorModeValue('white', 'gray.800')}
            height="100%"
        >
            <Box overflowY="auto" height="100%">
                <Flex direction="column" >
                    {notifications.map(notification => (
                        <Flex
                            key={notification.id}
                            mb="0.5rem"
                            mx="0.5rem"
                            direction="column"
                            p="1rem"
                            rounded="lg"
                            bg={'gray.700'}
                            position="relative"
                        >
                            <Flex align="center" pb="1rem">
                                <Tooltip label={dayjs(notification.createdAt).format("DD.MM. HH:mm")} placement="right">
                                    <Text fontSize="lg" fontWeight="bold">
                                        {NotificationTypeNames[notification.type]}
                                    </Text>
                                </Tooltip>
                                <Box ml="1rem">
                                    <a href={notification.infoSource.data?.url} target="_blank" rel="noreferrer">
                                        {SourceTypeLogoSmall[notification.infoSource.type]}
                                    </a>
                                </Box>
                            </Flex>
                            <Box position="absolute" right="0.5rem" top="0.5rem">
                                <IconButton
                                    icon={<CheckCircleIcon />}
                                    onClick={() => markNotificationAsRead(notification.id)}
                                    size="sm"
                                    variant="ghost"
                                    aria-label='Delete'
                                />
                            </Box>
                            <Box>
                                {getNotificationText(notification)}
                            </Box>
                        </Flex>
                    ))}
            </Flex>
            </Box>
        </Box>
    )
}