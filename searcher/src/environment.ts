import * as t from "io-ts";
import { IntFromString } from "io-ts-types";

export const EnvironmentStructure = t.type({
    SEARCH_GAME_CONCURRENCY: IntFromString,
});

export type Environment = t.TypeOf<typeof EnvironmentStructure>;
