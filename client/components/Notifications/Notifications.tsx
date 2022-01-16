import { Box, Flex, Text } from "@chakra-ui/layout";
import { useNotificationContext } from "../../providers/NotificationProvider";
import dayjs from "dayjs";
import { NotificationDto, NotificationType } from "@game-watch/shared";
import { SourceTypeLogoSmall } from "../InfoSource/SourceTypeLogo";
import { useColorModeValue, Tooltip } from "@chakra-ui/react";

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
    // TODO: Set the name as soon as user completed game
    const gameName = <Text fontWeight="bold" display="inline">{game.name || game.search}</Text>;

    if (isNotificationOfType(notification, NotificationType.GameReduced)) {
        const { final, initial } = notification.data;
        return <>{gameName} {`was reduced from ${initial}€ to ${final}€!`}</>;
    }

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

export const Notifications: React.FC<{}> = () => {
    const { notifications } = useNotificationContext();

    return (
        <Box
            pt="1rem"
            bg={useColorModeValue('white', 'gray.800')}
            height="100%"
        >
            <Flex direction="column" mt="1rem">
                {notifications.map(notification => (
                    <Flex
                        key={notification.id}
                        mb="0.5rem"
                        mx="0.5rem"
                        direction="column"
                        p="1rem"
                        rounded="lg"
                        bg={'gray.700'}
                    >
                        <Flex justify="space-between" align="center" pb="1rem">
                            <Tooltip label={dayjs(notification.createdAt).format("DD.MM. HH:mm")} placement="right">
                                <Text fontSize="lg" fontWeight="bold">
                                    {NotificationTypeNames[notification.type]}
                                </Text>
                            </Tooltip>
                            <Box>
                                <a href={notification.infoSource.data?.url} target="_blank" rel="noreferrer">
                                    {SourceTypeLogoSmall[notification.infoSource.type]}
                                </a>
                            </Box>

                        </Flex>
                        <Box>
                            {getNotificationText(notification)}
                        </Box>
                    </Flex>
                ))}
            </Flex>
        </Box>
    )
}