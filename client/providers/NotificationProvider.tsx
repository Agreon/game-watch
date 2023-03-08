import { useDisclosure } from '@chakra-ui/react';
import { NotificationDto } from '@game-watch/shared';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { useHttp } from '../util/useHttp';
import { usePolling } from '../util/usePolling';

export interface NotificationCtx {
    notifications: NotificationDto[]
    markNotificationAsRead: (id: string) => Promise<void>
    markAllNotificationsAsRead: () => Promise<void>
    removeNotificationsForGame: (gameId: string) => void
    removeNotificationsForInfoSource: (sourceId: string) => void
    showNotificationSidebar: boolean
    notificationSidebarRef: React.MutableRefObject<HTMLDivElement | null>
    notificationSidebarIconRef: React.MutableRefObject<HTMLButtonElement | null>
    closeNotificationSidebar: () => void
    toggleNotificationSidebar: () => void
}

export const NotificationContext = React.createContext<NotificationCtx | undefined>(undefined);

export function useNotificationContext() {
    const context = useContext(NotificationContext);

    return context as NotificationCtx;
}

export const NotificationProvider: React.FC<{
    children: React.ReactChild,
}> = ({ children }) => {
    const { requestWithErrorHandling: requestWithErrorHandling, http } = useHttp();
    const [notifications, setNotifications] = useState<NotificationDto[]>([]);

    const pollNotifications = useCallback(async () => {
        const { data } = await http.get<NotificationDto[]>(`/notification`);
        setNotifications(data);

        // Never stop
        return false;
    }, [http]);
    // Retrieve notifications once at the start to not wait an hour.
    useEffect(() => {
        (async () => await pollNotifications())();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    usePolling(pollNotifications, 60 * 60 * 1000, []);

    const markNotificationAsRead = useCallback(async (notificationId: string) => {
        await requestWithErrorHandling(async http => {
            await http.post(`/notification/${notificationId}/read`);
            setNotifications(currentNotifications => currentNotifications.filter(
                ({ id }) => id !== notificationId
            ));
        });
    }, [requestWithErrorHandling]);

    const markAllNotificationsAsRead = useCallback(async () => {
        await requestWithErrorHandling(async http => {
            await http.post(`/notification/mark-all-as-read`);
            setNotifications(() => []);
        });
    }, [requestWithErrorHandling]);

    const removeNotificationsForGame = useCallback((gameId: string) => {
        setNotifications(currentNotifications =>
            currentNotifications.filter(notification => notification.game.id !== gameId)
        );
    }, []);

    const removeNotificationsForInfoSource = useCallback((sourceId: string) => {
        setNotifications(currentNotifications =>
            currentNotifications.filter(notification => notification.infoSource.id !== sourceId)
        );
    }, []);

    const {
        isOpen: showNotificationSidebar,
        onClose: closeNotificationSidebar,
        onToggle: toggleNotificationSidebar
    } = useDisclosure();

    const notificationSidebarRef = useRef<HTMLDivElement | null>(null);
    const notificationSidebarIconRef = useRef<HTMLButtonElement | null>(null);

    // Close sidebar on outside click
    const handleClick = useCallback((event: MouseEvent) => {
        if (
            notificationSidebarRef.current?.contains(event.target as Node) === false
            && notificationSidebarIconRef.current?.contains(event.target as Node) === false
        ) {
            closeNotificationSidebar();
        }
    }, [notificationSidebarRef, closeNotificationSidebar]);

    // Close sidebar on escape
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.keyCode === 27) {
            closeNotificationSidebar();
        }
    }, [closeNotificationSidebar]);

    useEffect(() => {
        document.addEventListener('click', handleClick, true);
        document.addEventListener('keydown', handleKeyDown, true);
        return () => {
            document.removeEventListener('click', handleClick, true);
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [handleClick, handleKeyDown]);

    const contextValue = useMemo(() => ({
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        removeNotificationsForGame,
        removeNotificationsForInfoSource,
        showNotificationSidebar,
        closeNotificationSidebar,
        toggleNotificationSidebar,
        notificationSidebarRef,
        notificationSidebarIconRef
    }), [
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        removeNotificationsForGame,
        removeNotificationsForInfoSource,
        showNotificationSidebar,
        closeNotificationSidebar,
        toggleNotificationSidebar,
        notificationSidebarRef,
        notificationSidebarIconRef
    ]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};
