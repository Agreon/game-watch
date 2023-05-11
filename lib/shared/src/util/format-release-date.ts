import dayjs from 'dayjs';

import { StoreReleaseDateInformation } from '../types/info-source';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

export const formatReleaseDate = (releaseDate?: StoreReleaseDateInformation): string => {
    if (!releaseDate) {
        return 'TBD';
    }

    if (!releaseDate.isExact) {
        return releaseDate.date;
    } else {
        return dayjs(releaseDate.date).format('DD MMM. YYYY');
    }
};
