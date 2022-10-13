export const extract = (content: string, regex: RegExp) => {
    const result = new RegExp(regex).exec(content);

    return result ? result[0] : undefined;
};
