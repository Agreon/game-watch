const IGNORED_TOKENS = [
    "a",
    "the",
    "of"
];

export const matchingName = (name: string, search: string) => {
    const nameTokens = name
        .replace(/:|™|®|-/g, "")
        .toLowerCase()
        .split(" ")
        .filter(value => !!value);

    const searchTokens = search
        .replace(/\d/, "")
        .toLowerCase()
        .split(" ")
        .filter(value => !!value);

    return searchTokens.some(searchToken =>
        !IGNORED_TOKENS.includes(searchToken.trim())
        && nameTokens.some(nameToken => nameToken.includes(searchToken.trim()))
    );
};
