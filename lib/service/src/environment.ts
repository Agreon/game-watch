import * as t from "io-ts";

export const EnvironmentStructure = t.type({
    SENTRY_DSN: t.string,
    SENTRY_ENVIRONMENT: t.string
});

export type Environment = t.TypeOf<typeof EnvironmentStructure>;
