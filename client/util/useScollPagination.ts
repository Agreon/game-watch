import { useCallback, useEffect } from 'react';

export function useScrollPagination(
    { loadAtScrollPercentage, onScrollPagination }: {
        loadAtScrollPercentage: number;
        onScrollPagination: () => void
    },
) {
    const scrollHandler = useCallback(function (this: HTMLElement) {
        const scrollPercentage = (this.scrollTop / (this.scrollHeight - this.clientHeight)) * 100;
        if (scrollPercentage > loadAtScrollPercentage) {
            onScrollPagination();
        }
    }, [loadAtScrollPercentage, onScrollPagination]);

    useEffect(() => {
        const scrollContainer = document.getElementById('scrollContainer');
        if (!scrollContainer) {
            return;
        }

        scrollContainer.addEventListener('scroll', scrollHandler);

        return () => {
            scrollContainer.removeEventListener('scroll', scrollHandler);
        };
    }, [scrollHandler]);
}
