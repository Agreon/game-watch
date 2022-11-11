export const parseCurrencyValue = (value?: string) => {
    if (!value) {
        return undefined;
    }

    const parsedValue = parseFloat(
        value.replace(/€|\$|CHF|pуб\.|£|R/g, '')
            .replace(',', '.')
            .trim()
    );
    if (isNaN(parsedValue)) {
        return undefined;
    }
    return parsedValue;
};
