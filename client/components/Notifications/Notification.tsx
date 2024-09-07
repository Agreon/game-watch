import { CheckCircleIcon } from '@chakra-ui/icons';
import { Box, Flex, IconButton, Text, Tooltip } from '@chakra-ui/react';
import {
    formatPrice,
    formatReleaseDate,
    NotificationDto,
    NotificationType
} from '@game-watch/shared';
import dayjs from 'dayjs';
import React, { useCallback, useMemo } from 'react';

import { useAction } from '../../util/useAction';
import { SourceTypeLogoSmall } from '../InfoSource/SourceTypeLogo';
import { LoadingSpinner } from '../LoadingSpinner';

const NotificationTypeNames: Record<NotificationType, string> = {
    [NotificationType.NewStoreEntry]: 'New store entry',
    [NotificationType.ReleaseDateChanged]: 'New release date',
    [NotificationType.GameReleased]: 'Game released',
    [NotificationType.GameReduced]: 'Game reduced',
    [NotificationType.NewMetacriticRating]: 'Game rated',
    [NotificationType.NewMetacriticUserRating]: 'Game rated',
    [NotificationType.NewOpenCriticRating]: 'Game rated',
    [NotificationType.NewProtonDbRating]: 'Game rated',
    [NotificationType.ProtonDbRatingIncreased]: 'Rating increased',
    [NotificationType.LeftEarlyAccess]: 'Game left Early Access',
    [NotificationType.AddedToPsPlus]: 'Game added to PS Plus',
    [NotificationType.ResolveError]: 'Resolve error',
};

function isNotificationOfType<T extends NotificationType, TValue extends NotificationType>(
    notification: NotificationDto<NotificationType>,
    type: TValue
): notification is NotificationDto<Extract<T, TValue>> {
    return notification.type === type;
}

const getNotificationText = (notification: NotificationDto) => {
    const { game, infoSource } = notification;

    const gameName = <Text fontWeight="bold" display="inline">{game.name || game.search}</Text>;
    // We rather display the resolved name so a user can see instantly if an unrelated
    // game was added.
    const infoSourceName = infoSource.data.fullName;

    if (isNotificationOfType(notification, NotificationType.GameReduced)) {
        const { final, initial } = notification.data;
        const initialPrice = formatPrice({ price: initial, country: infoSource.country });
        const finalPrice = formatPrice({ price: final, country: infoSource.country });
        return <>{gameName} {`was reduced from ${initialPrice} to ${finalPrice}!`}</>;
    }

    if (isNotificationOfType(notification, NotificationType.ReleaseDateChanged)) {
        const releaseDate = notification.data;
        const formattedDate = formatReleaseDate(releaseDate);
        return <>{gameName} {`will be released ${releaseDate.isExact ? 'on' : 'in'} ${formattedDate}!`}</>;
    }

    switch (notification.type) {
        case NotificationType.GameReleased:
            return <>{gameName} will be available today!</>;
        case NotificationType.NewStoreEntry:
            return <>{infoSourceName} was added to the store!</>;
        case NotificationType.NewMetacriticRating:
            return <>{infoSourceName} received a rating!</>;
        case NotificationType.NewMetacriticUserRating:
            return <>{infoSourceName} received a user rating!</>;
        case NotificationType.NewOpenCriticRating:
            return <>{infoSourceName} received a rating!</>;
        case NotificationType.NewProtonDbRating:
            return <>{infoSourceName} received a rating!</>;
        case NotificationType.ProtonDbRatingIncreased:
            return <>{infoSourceName} rating increased!</>;
        case NotificationType.LeftEarlyAccess:
            return <>{infoSourceName} left Early Access!</>;
        case NotificationType.AddedToPsPlus:
            return <>{infoSourceName} was added to the PS Plus library!</>;
        case NotificationType.ResolveError:
            return <>{gameName} could not be resolved!</>;
    }
};

const NotificationComponent: React.FC<{
    notification: NotificationDto,
    markNotificationAsRead: (id: string) => Promise<void>,
    showLoadingSpinner: boolean
}> = ({ notification, markNotificationAsRead, showLoadingSpinner }) => {
    const { loading, execute: markAsRead } = useAction(markNotificationAsRead);

    const notificationText = useMemo(() => getNotificationText(notification), [notification]);

    const onMarkAsRead = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        markAsRead(notification.id);
    }, [markAsRead, notification.id]);

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
                    <Tooltip
                        label={dayjs(notification.createdAt).format('DD.MM. HH:mm')}
                        placement="top"
                    >
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
            {(loading || showLoadingSpinner) && <LoadingSpinner size="md" />}
        </Box>
    );
};

export const Notification = React.memo(NotificationComponent);
