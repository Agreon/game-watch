import * as t from "io-ts";
import { IntFromString } from "io-ts-types";

export const EnvironmentStructure = t.type({
    SEARCH_GAME_CONCURRENCY: IntFromString,
    SYNC_SOURCES_AT: t.string,
});

export type Environment = t.TypeOf<typeof EnvironmentStructure>;
