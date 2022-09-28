export const parseCurrencyValue = (value?: string) => {
    if (!value) {
        return undefined;
    }

    const parsedValue = parseFloat(value.replace(/€|\$/g, '').replace(',', '.'));
    if (isNaN(parsedValue)) {
        return undefined;
    }
    return parsedValue;
};
