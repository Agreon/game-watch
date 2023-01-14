import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { useEffect } from 'react';

import { useErrorHandler } from './useErrorHandler';

// We wait the throttle timeout + some buffer to be safe if some concurrent requests reset the ttl.
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const WAIT_MS_ON_THROTTLE = (parseInt(process.env.NEXT_PUBLIC_THROTTLE_TTL!) * 1000) + (5 * 1000);

/**
 * Takes away the hustle of dealing with possible rate limiting.
 *
 * @param method Method to execute on each interval.
 * @param interval Duration of interval in ms.
 * @param dependencies On what dependency change the interval should be cleared.
 */
export const usePolling = (
    method: () => Promise<boolean>,
    interval: number,
    dependencies: unknown[]
) => {
    const handleError = useErrorHandler();

    useEffect(() => {
        // TODO: Maybe needed outside of hook
        let skip_requests_before = dayjs();

        const intervalId = setInterval(async () => {
            if (dayjs().isBefore(skip_requests_before)) {
                return;
            }

            try {
                if (await method()) {
                    clearInterval(intervalId);
                }
            } catch (error) {
                if (error instanceof AxiosError && error.response?.status == 429) {
                    skip_requests_before = dayjs().add(WAIT_MS_ON_THROTTLE, 'ms');
                } else {
                    handleError(error);
                }
            }
        }, interval);

        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencies, method, interval, handleError]);
};
