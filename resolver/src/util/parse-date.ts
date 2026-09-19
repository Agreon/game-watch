import 'dayjs/locale/bg';
import 'dayjs/locale/de';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/it';
import 'dayjs/locale/nl';
import 'dayjs/locale/pt';
import 'dayjs/locale/ru';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const parseDate = (
    dateString: string | undefined | null,
    expectedFormats?: string[],
    locale?: string
) => {
    if (!dateString) {
        return undefined;
    }

    const parsedDate = dayjs(dateString.trim(), expectedFormats, locale);

    if (!parsedDate.isValid()) {
        return undefined;
    }

    return parsedDate.toDate();
};
