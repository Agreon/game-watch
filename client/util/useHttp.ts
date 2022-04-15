import { useToast, UseToastOptions } from "@chakra-ui/toast";
import axios, { AxiosError, AxiosInstance } from "axios";
import { useCallback, useMemo } from "react";

import { setLocalStoredUser } from "../providers/UserProvider";

axios.defaults.withCredentials = true;

export function useHttp(logoutOnAuthFailure: boolean = true) {
    const toast = useToast();
    const http = useMemo(() => {
        const client = axios.create({ baseURL: process.env.NEXT_PUBLIC_SERVER_URL });

        client.interceptors.response.use(
            undefined,
            async (error) => {
                if (error.response?.status === 401 && error.config.url !== "/auth/login") {
                    if (logoutOnAuthFailure && (error.config.url === "/auth/refresh" || error.config.url === "/auth/logout")) {
                        setLocalStoredUser(null);
                        location.href = "/?loggedOut=true";
                        return;
                    }

                    if (!logoutOnAuthFailure && error.config.url === "/auth/refresh") {
                        throw error;
                    }

                    await client.post("/auth/refresh");

                    return await client.request(error.config);
                }

                return Promise.reject(error);
            },
        );

        return client;
    }, [logoutOnAuthFailure]);

    const handleError = useCallback((error: unknown, toastOptions?: Partial<UseToastOptions>) => {
        console.error(error);
        toast({
            title: "Error",
            description: "Unexpected Error. Please try again.",
            status: "error",
            position: "top-right",
            ...toastOptions
        });
    }, [toast]);

    const withRequest = useCallback(
        async <T>(
            request: (http: AxiosInstance) => Promise<T>,
            errorHandler?: (error: AxiosError) => void,
        ): Promise<T | Error> => {
            try {
                return await request(http);
            } catch (error: any) {
                if (errorHandler) {
                    errorHandler(error);
                    return error;
                }
                handleError(error);
                return error;
            }
        }, [http, handleError]);

    return { withRequest, handleError };
}
