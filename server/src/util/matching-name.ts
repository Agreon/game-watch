export const matchingName = (name: string, search: string) => {
    const nameTokens = name.replace(/:|™/g, "").toLowerCase().split(" ");
    const searchTokens = search.toLowerCase().split(" ");

    return nameTokens.some(token => searchTokens.includes(token));
}