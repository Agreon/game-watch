import dayjs from 'dayjs';

import { isNonSpecificDate } from './is-non-specific-date';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

export const formatReleaseDate = (
    { releaseDate, originalDate }: { releaseDate?: Date; originalDate?: string }
) => {
    if (originalDate && isNonSpecificDate(originalDate)) {
        return originalDate;
    }

    if (releaseDate) {
        return dayjs(releaseDate).format('DD MMM. YYYY');
    }

    return 'TBD';
};
