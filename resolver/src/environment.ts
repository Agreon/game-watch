import * as t from "io-ts";
import { IntFromString } from "io-ts-types";

export const EnvironmentStructure = t.type({
    RESOLVE_GAME_CONCURRENCY: IntFromString,
    RESOLVE_SOURCE_CONCURRENCY: IntFromString,
    REDIS_HOST: t.string,
    REDIS_PASSWORD: t.string,
    REDIS_PORT: IntFromString,
});

export type Environment = t.TypeOf<typeof EnvironmentStructure>;
