import { useDisclosure } from "@chakra-ui/react";
import { NotificationDto } from "@game-watch/shared";
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useHttp } from "../util/useHttp";

export interface NotificationCtx {
    notifications: NotificationDto[]
    markNotificationAsRead: (id: string) => Promise<void>
    showNotificationSidebar: boolean
    notificationSidebarRef: React.MutableRefObject<HTMLDivElement | null>
    openNotificationSidebar: () => void
    closeNotificationSidebar: () => void
}

export const NotificationContext = React.createContext<NotificationCtx | undefined>(undefined);

export function useNotificationContext() {
    const context = useContext(NotificationContext);

    return context as NotificationCtx;
}

export const NotificationProvider: React.FC<{}> = ({ children }) => {
    const { withRequest, handleError } = useHttp();
    const [notifications, setNotifications] = useState<NotificationDto[]>([]);

    useEffect(() => {
        (async () => {
            await withRequest(async http => {
                do {
                    try {
                        const { data } = await http.get<NotificationDto[]>(`/notification`);
                        setNotifications(data);
                    } catch (error) {
                        handleError(error);
                    } finally {
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    }
                } while (true)
            });
        }
        )();
    }, [setNotifications, handleError, withRequest]);

    const markNotificationAsRead = useCallback(async (notificationId: string) => {
        await withRequest(async http => {
            await http.post(`/notification/${notificationId}/read`);
            setNotifications(currentNotifications => currentNotifications.filter(({ id }) => id !== notificationId));
        });
    }, [withRequest]);

    const { isOpen: showNotificationSidebar, onOpen: openNotificationSidebar, onClose: closeNotificationSidebar } = useDisclosure();

    const notificationSidebarRef = useRef<HTMLDivElement | null>(null);

    // TODO: https://chakra-ui.com/docs/hooks/use-outside-click?
    // Close sidebar on outside click
    const handleClick = useCallback((event) => {
        if (notificationSidebarRef.current && !notificationSidebarRef.current.contains(event.target)) {
            closeNotificationSidebar();
        }
    }, [notificationSidebarRef, closeNotificationSidebar]);

    // Close sidebar on escape
    const handleKeyDown = useCallback((event) => {
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
        openNotificationSidebar,
        closeNotificationSidebar,
        notificationSidebarRef
    }), [notifications, markNotificationAsRead, showNotificationSidebar, notificationSidebarRef, openNotificationSidebar, closeNotificationSidebar]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    )
}
