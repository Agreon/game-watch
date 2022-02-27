const EXCLUDED_TOKENS = [
    "the"
];

export const matchingName = (name: string, search: string) => {
    const nameTokens = name.replace(/:|™|®|-/g, "").toLowerCase().split(" ");
    const searchTokens = search.replace(/\d/, "").toLowerCase().split(" ");

    return nameTokens.some(token => !EXCLUDED_TOKENS.includes(token) && searchTokens.includes(token));
};
