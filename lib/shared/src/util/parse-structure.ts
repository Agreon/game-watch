import { isLeft } from 'fp-ts/es6/Either';
import * as t from 'io-ts';
import reporter from 'io-ts-reporters';

export class ParseError extends Error {
    public constructor(
        public message: string,
        public structure: string,
        public validation: t.Validation<unknown>,
    ) {
        super();
    }
}

export const parseStructure = <T extends t.Any>(
    definition: T,
    data: Record<string, unknown>
): t.TypeOf<T> => {
    const validation = definition.decode(data);

    if (isLeft(validation)) {
        throw new ParseError(
            `Validation of '${definition.name}' failed: \n${reporter.report(validation).map(
                (report) => `\t${report}\n`,
            ).join()}`,
            definition.name,
            validation
        );
    }

    return validation.right;
};
