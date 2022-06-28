import * as t from "io-ts";
import { IntFromString } from "io-ts-types";

export const EnvironmentStructure = t.type({
    CREATE_NOTIFICATIONS_CONCURRENCY: IntFromString,
    SENDGRID_API_KEY: t.string,
    API_URL: t.string,
    PUBLIC_URL: t.string,
});

export type Environment = t.TypeOf<typeof EnvironmentStructure>;
