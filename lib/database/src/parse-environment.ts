import { isLeft } from 'fp-ts/lib/Either';
import * as t from "io-ts";
import reporter from 'io-ts-reporters';

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