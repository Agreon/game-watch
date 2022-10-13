import { Redis } from 'ioredis';

export interface CacheService {
    set: (key: string, data: unknown) => Promise<void>;
    get: <T>(key: string) => Promise<T | null>;
}

export class RedisCacheService implements CacheService {
    public constructor(
        public readonly redis: Redis,
        public readonly cacheTimeInSeconds: number,
    ) { }

    public async set(key: string, data: unknown): Promise<void> {
        await this.redis.set(key, JSON.stringify(data), 'EX', this.cacheTimeInSeconds);
    }

    public async get<T>(key: string): Promise<T | null> {
        const data = await this.redis.get(key);
        if (!data) {
            return null;
        }
        return JSON.parse(data) as T;
    }
}

export class NonCachingService implements CacheService {
    public async set(): Promise<void> {
    }

    public async get<T>(): Promise<T | null> {
        return null;
    }
}
