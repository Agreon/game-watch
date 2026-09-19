import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { StoreReleaseDateInformation } from '../types/info-source';

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
