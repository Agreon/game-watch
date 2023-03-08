import { useToast, UseToastOptions } from '@chakra-ui/react';
import { useCallback } from 'react';

import { DEFAULT_TOAST_OPTIONS } from './default-toast-options';

export const useErrorHandler = () => {
    const toast = useToast(DEFAULT_TOAST_OPTIONS);

    return useCallback((error: unknown, toastOptions?: Partial<UseToastOptions>) => {
        console.error(error);
        toast({
            title: 'Error',
            description: 'Unexpected Error. Please try again.',
            status: 'error',
            ...toastOptions
        });
    }, [toast]);
};
