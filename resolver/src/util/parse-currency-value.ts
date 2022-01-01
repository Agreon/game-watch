export const parseCurrencyValue = (value: string) => {
    const parsedValue = parseFloat(value.replace("€", "").replace(",", "."));
    if (isNaN(parsedValue)) {
        return undefined;
    }
    return parsedValue;
};
