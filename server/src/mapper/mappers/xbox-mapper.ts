import { InfoSourceType } from '@game-watch/shared';

import { UrlMapper } from '../mapper-service';

export class XboxMapper implements UrlMapper {
    public type = InfoSourceType.Xbox;

    public async mapUrlToId(url: string): Promise<string> {
        const mapped = new URL(url);
        if (mapped.hostname !== 'xbox.com') {
            throw new Error('Not mappable');
        }

        return mapped.href;
    }
}
