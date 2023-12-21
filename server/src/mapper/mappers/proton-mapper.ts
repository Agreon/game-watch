import { InfoSourceType } from '@game-watch/shared';

import { UrlMapper } from '../mapper-service';

export class ProtonMapper implements UrlMapper {
    public type = InfoSourceType.Proton;

    public async mapUrlToId(url: string): Promise<string> {
        const { hostname } = new URL(url);
        if (hostname !== 'www.protondb.com') {
            throw new Error('Not mappable');
        }

        const parts = url.split('/');
        const gameId = parts[parts.length - 1];
        if (!gameId.length) {
            throw new Error('Could not extract gameId');
        }

        return encodeURIComponent(gameId);
    }
}
