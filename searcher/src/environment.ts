import * as t from 'io-ts';
import { BooleanFromString, IntFromString } from 'io-ts-types';

export const EnvironmentStructure = t.type({
    SEARCH_GAME_CONCURRENCY: IntFromString,
    SYNC_SOURCES_AT: t.string,
    REDIS_HOST: t.string,
    REDIS_PASSWORD: t.string,
    REDIS_PORT: IntFromString,
    CACHING_ENABLED: BooleanFromString,
    CACHE_TIME_IN_SECONDS: IntFromString,
    SENDGRID_API_KEY: t.string,
});

export type Environment = t.TypeOf<typeof EnvironmentStructure>;
