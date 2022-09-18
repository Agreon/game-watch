import { useDisclosure } from "@chakra-ui/react";
import { NotificationDto } from "@game-watch/shared";
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { useHttp } from "../util/useHttp";

export interface NotificationCtx {
    notifications: NotificationDto[]
    markNotificationAsRead: (id: string) => Promise<void>
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
    const { withRequest, handleError } = useHttp();
    const [notifications, setNotifications] = useState<NotificationDto[]>([]);

    useEffect(() => {
        const intervalId = setInterval(async () => {
            await withRequest(async http => {
                const { data } = await http.get<NotificationDto[]>(`/notification`);
                setNotifications(data);
            });
        }, 5000);

        return () => clearInterval(intervalId);
    }, [setNotifications, handleError, withRequest]);

    const markNotificationAsRead = useCallback(async (notificationId: string) => {
        await withRequest(async http => {
            await http.post(`/notification/${notificationId}/read`);
            setNotifications(currentNotifications => currentNotifications.filter(
                ({ id }) => id !== notificationId
            ));
        });
    }, [withRequest]);

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
        showNotificationSidebar,
        closeNotificationSidebar,
        toggleNotificationSidebar,
        notificationSidebarRef,
        notificationSidebarIconRef
    }), [
        notifications,
        markNotificationAsRead,
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
