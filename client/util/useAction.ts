import { useToast } from '@chakra-ui/react';
import { useCallback, useState } from 'react';

import { DEFAULT_TOAST_OPTIONS } from './default-toast-options';

interface UseActionOptions<R> {
    onSuccess?: (result: R) => void
    onError?: (error: Error) => void | string
}

export const useAction = <T extends (...args: any[]) => Promise<Error | R>, R>(
    action: T,
    options?: UseActionOptions<R>
) => {
    const toast = useToast(DEFAULT_TOAST_OPTIONS);
    const [loading, setLoading] = useState(false);

    const execute = useCallback(async (...params: Parameters<T>) => {
        setLoading(true);
        try {
            const result = await action(...params);
            if (result instanceof Error) {
                const errorText = options?.onError && options.onError(result);
                if (errorText) {
                    toast({
                        title: 'Error',
                        description: errorText,
                        status: 'error',
                    });
                }
                return;
            }

            options?.onSuccess && options.onSuccess(result);
        }
        finally {
            setLoading(false);
        }
    }, [action, options, toast]);

    return { loading, execute };
};
