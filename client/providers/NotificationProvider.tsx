import { NotificationDto } from "@game-watch/shared";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useHttp } from "../util/useHttp";

export interface NotificationCtx {
    notifications: NotificationDto[]
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
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                } while (true)
            });
        }
        )();
    }, [setNotifications, handleError, withRequest]);

    const contextValue = useMemo(() => ({
        notifications,
    }), [notifications]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    )
}