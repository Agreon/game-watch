import { InfoSourceType } from '@game-watch/shared';

import { UrlMapper } from '../mapper-service';

export class MetacriticMapper implements UrlMapper {
    public type = InfoSourceType.Metacritic;

    public async mapUrlToId(url: string): Promise<string> {
        const mapped = new URL(url);
        if (mapped.hostname !== 'www.metacritic.com') {
            throw new Error('Not mappable');
        }

        return mapped.href;
    }
}
