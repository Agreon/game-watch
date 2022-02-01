import * as t from "io-ts";
import { BooleanFromString, IntFromString } from "io-ts-types";

export const EnvironmentStructure = t.type({
    DATABASE_NAME: t.string,
    DATABASE_USER: t.string,
    DATABASE_PASSWORD: t.string,
    DATABASE_HOST: t.string,
    DATABASE_PORT: IntFromString,
    ENABLE_MIKRO_ORM_DEBUGGING: BooleanFromString
});

export type Environment = t.TypeOf<typeof EnvironmentStructure>;
