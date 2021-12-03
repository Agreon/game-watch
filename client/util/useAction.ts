import { useCallback, useState } from "react";

interface UseActionOptions<R> {
    onSuccess?: (result: R) => void;
    onError?: (result: Error) => void
}

export const useAction = <T, R>(
    action: (params: T) => Promise<Error | R>,
    options?: UseActionOptions<R>
) => {
    const [loading, setLoading] = useState(false);

    const execute = useCallback(async (params: T) => {
        setLoading(true);
        try {
            const result = await action(params);
            if (result instanceof Error) {
                return options?.onError && options.onError(result);
            }

            options?.onSuccess && options.onSuccess(result);
        } finally {
            setLoading(false);
        }
    }, [action, options]);

    return { loading, execute };
}
