import dayjs from 'dayjs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

// At least steam returns dates in unspecific ranges like checked below.
const NonSpecificDateRegex = /^(Winter |Summer |Spring |Fall |Jan |Feb |Mar |Apr |Mai |Jun |Jul |Aug |Sep |Oct |Nov |Dec )?(20(\d\d))$/;

export const formatReleaseDate = (
    { releaseDate, originalDate }: { releaseDate?: Date; originalDate?: string }
) => {
    if (originalDate && NonSpecificDateRegex.test(originalDate)) {
        return originalDate;
    }

    if (releaseDate) {
        // TODO: Depend on user lang?
        return dayjs(releaseDate).format('DD MMM, YYYY');
    }

    return 'TBD';
};
