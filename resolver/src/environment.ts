import * as t from 'io-ts';
import { BooleanFromString, IntFromString } from 'io-ts-types';

export const EnvironmentStructure = t.type({
    RESOLVE_SOURCE_CONCURRENCY: IntFromString,
    REDIS_HOST: t.string,
    REDIS_PASSWORD: t.string,
    REDIS_PORT: IntFromString,
    CACHING_ENABLED: BooleanFromString
});

export type Environment = t.TypeOf<typeof EnvironmentStructure>;
