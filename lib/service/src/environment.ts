import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types";

export const EnvironmentStructure = t.type({
    SENTRY_DSN: t.string,
    SENTRY_ENVIRONMENT: t.string,
    PRETTY_LOGGING: BooleanFromString
});

export type Environment = t.TypeOf<typeof EnvironmentStructure>;
