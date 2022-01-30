import * as t from "io-ts";
import { IntFromString } from "io-ts-types";

export const EnvironmentStructure = t.type({
    REDIS_HOST: t.string,
    REDIS_PASSWORD: t.string,
    REDIS_PORT: IntFromString,
});

export type Environment = t.TypeOf<typeof EnvironmentStructure>;
