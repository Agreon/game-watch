import { useToast, UseToastOptions } from "@chakra-ui/toast";
import axios, { AxiosInstance } from "axios";
import { useCallback, useMemo } from "react";

export function useHttp() {
    const toast = useToast();
    const http = useMemo(() => axios.create({ baseURL: process.env.NEXT_PUBLIC_SERVER_URL }), []);

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
            errorHandler?: (error: unknown) => void
        ): Promise<T | undefined> => {
            try {
                return await request(http);
            } catch (error) {
                if (errorHandler) {
                    errorHandler(error);
                    return;
                }
                handleError(error)
            }
        }, [http, handleError]);

    return { withRequest, handleError }
}