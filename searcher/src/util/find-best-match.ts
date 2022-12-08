import assert from 'assert';
import levenshtein from 'fast-levenshtein';

export const findBestMatch = <T extends Record<string, unknown>>(
    search: string,
    hits: T[],
    nameKey: keyof T,
): T => {
    const best_hit: { distance: number; hit: T | null } = {
        distance: Number.MAX_VALUE,
        hit: null,
    };

    for (const hit of hits) {
        const name = hit[nameKey] ?? '';
        assert(typeof name === 'string');

        const distance = levenshtein.get(search, name, { useCollator: true });
        if (distance < best_hit.distance) {
            best_hit.distance = distance;
            best_hit.hit = hit;
        }
    }

    return (best_hit.hit ?? hits[0]) as T;
};
