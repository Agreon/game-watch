import { isLeft } from "fp-ts/Either";
import * as t from "io-ts";
import reporter from "io-ts-reporters";

export class ParseError extends Error {
  public constructor(
    public message: string,
    public structure: string,
    public validation: t.Errors,
  ) {
    super();
  }
}

export const parseStructure = <A, O>(
  definition: t.Type<A, O, unknown>,
  data: Record<string, unknown>,
): A => {
  const validation = definition.decode(data);

  if (isLeft(validation)) {
    throw new ParseError(
      `Validation of '${definition.name}' failed: \n${reporter
        .report(validation)
        .map((report) => `\t${report}\n`)
        .join()}`,
      definition.name,
      validation.left,
    );
  }

  return validation.right;
};
