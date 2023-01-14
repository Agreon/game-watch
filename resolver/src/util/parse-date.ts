import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
require('dayjs/locale/de');
require('dayjs/locale/fr');
require('dayjs/locale/it');
require('dayjs/locale/pt');
require('dayjs/locale/es');
require('dayjs/locale/bg');
require('dayjs/locale/nl');
require('dayjs/locale/ru');

dayjs.extend(customParseFormat);

export const parseDate = (
    dateString: string | undefined,
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
