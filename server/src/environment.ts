import * as t from "io-ts";
import { IntFromString } from "io-ts-types";

export const EnvironmentStructure = t.type({
    SENTRY_ENVIRONMENT: t.string,
    SENTRY_DSN: t.string,
    DATABASE_NAME: t.string,
    DATABASE_USER: t.string,
    DATABASE_PASSWORD: t.string,
    DATABASE_HOST: t.string,
    DATABASE_PORT: t.string,
    SERVER_PORT: t.string,
    CORS_ORIGIN: t.string,
    REDIS_HOST: t.string,
    REDIS_PASSWORD: t.string,
    SYNC_SOURCES_AT: t.string,
    BCRYPT_HASH_SALT_ROUNDS: IntFromString,
    JWT_ALGORITHM: t.string,
    JWT_PUBLIC_KEY: t.string,
    JWT_PRIVATE_KEY: t.string,
    JWT_ACCESS_TOKEN_EXPIRES_IN: t.string,
    JWT_REFRESH_TOKEN_EXPIRES_IN: t.string,
});

export type Environment = t.TypeOf<typeof EnvironmentStructure>;
