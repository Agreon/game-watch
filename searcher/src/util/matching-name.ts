const EXCLUDED_TOKENS = [
    "the"
];

export const matchingName = (name: string, search: string) => {
    const nameTokens = name.replace(/:|™|®|-/g, "").toLowerCase().split(" ");
    const searchTokens = search.replace(/\d/, "").toLowerCase().split(" ");

    return searchTokens.some(searchToken =>
        !EXCLUDED_TOKENS.includes(searchToken)
        && nameTokens.some(nameToken => nameToken.includes(searchToken))
    );
};
