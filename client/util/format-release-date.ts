import dayjs from "dayjs";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

// At least steam returns dates in unspecific ranges like checked below.
const NonSpecificDateRegex = /^(Winter |Summer |Spring |Fall )?(20(\d\d))$/;

export const formatReleaseDate = ({ date, originalDate }: { date?: Date; originalDate?: string }) => {
    if (!date || !originalDate) {
        return "TBD";
    }

    if (NonSpecificDateRegex.test(originalDate)) {
        return originalDate;
    }

    return dayjs(date).format("DD MMM, YYYY");
};
