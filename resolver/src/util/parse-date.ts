import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
require('dayjs/locale/de');

dayjs.extend(customParseFormat);

export const parseDate = (dateString: string | undefined, expectedFormats: string[], locale?: string) => {
    if (!dateString) {
        return undefined;
    }

    const parsedDate = dayjs(dateString.trim(), expectedFormats, locale);

    if (!parsedDate.isValid()) {
        return undefined;
    }

    return parsedDate.toDate();
};
