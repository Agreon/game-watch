import { isLeft } from 'fp-ts/lib/Either';
import * as t from "io-ts";
import reporter from 'io-ts-reporters';

type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>;

type KeysToCamelCase<T> = {
    [K in keyof T as CamelCase<string & K>]: T[K] extends {} ? KeysToCamelCase<T[K]> : T[K]
};

export const parseEnvironment = <T extends t.Any>(definition: T, data: Record<string, unknown>): t.TypeOf<T> => {
    const validation = definition.decode(data);

    if (isLeft(validation)) {
        throw new Error(
            `Validation of environment failed: \n${reporter.report(validation).map(
                (report) => `\t${report}\n`,
            ).join()}`,
        );

    }

    return validation.right;
};