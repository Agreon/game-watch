import { InfoSourceType } from '@game-watch/shared';

import { UrlMapper } from '../mapper-service';

export class PlaystationMapper implements UrlMapper {
    public type = InfoSourceType.Playstation;

    public async mapUrlToId(url: string): Promise<string> {
        const mapped = new URL(url);
        if (mapped.hostname !== 'store.playstation.com') {
            throw new Error('Not mappable');
        }

        return mapped.href;
    }
}
