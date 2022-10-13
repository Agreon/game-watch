import { Country, InfoSourceType } from '@game-watch/shared';

import { UrlMapper } from '../mapper-service';

export class SwitchMapper implements UrlMapper {
    public type = InfoSourceType.Switch;

    public async mapUrlToId(url: string, userCountry: Country): Promise<string> {
        const mapped = new URL(url);

        if (userCountry === 'US') {
            if (mapped.hostname !== 'www.nintendo.com') {
                throw new Error('Not mappable');
            }
            return mapped.href;
        }

        if (userCountry === 'DE') {
            if (mapped.hostname !== 'www.nintendo.de' && mapped.hostname !== 'nintendo.de') {
                throw new Error('Not mappable');
            }
            return mapped.href;
        }

        if (mapped.hostname !== 'www.nintendo.com.au') {
            throw new Error('Not mappable');
        }

        const gameId = url.split('/')[url.split('/').length - 1];
        if (!gameId.length) {
            throw new Error('Could not extract gameId');
        }

        return gameId;
    }
}
