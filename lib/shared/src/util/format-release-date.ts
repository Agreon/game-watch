import dayjs from "dayjs";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

// At least steam returns dates in unspecific ranges like checked below.
const NonSpecificDateRegex = /^(Winter |Summer |Spring |Fall )?(20(\d\d))$/;

export const formatReleaseDate = ({ releaseDate, originalDate }: { releaseDate?: Date; originalDate?: string }) => {
    if (originalDate && NonSpecificDateRegex.test(originalDate)) {
        return originalDate;
    }

    if (releaseDate) {
        return dayjs(releaseDate).format("DD MMM, YYYY");
    }

    return "TBD";
};
