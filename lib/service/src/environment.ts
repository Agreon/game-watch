import * as t from "io-ts";

export const EnvironmentStructure = t.type({
    SENTRY_DSN: t.string,
    SENTRY_ENVIRONMENT: t.string,
    PRETTY_LOGGING: t.boolean
});

export type Environment = t.TypeOf<typeof EnvironmentStructure>;
