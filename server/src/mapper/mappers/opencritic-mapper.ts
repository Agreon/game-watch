import { InfoSourceType } from '@game-watch/shared';

import { UrlMapper } from '../mapper-service';

export class OpenCriticMapper implements UrlMapper {
    public type = InfoSourceType.OpenCritic;

    public async mapUrlToId(url: string): Promise<string> {
        const mapped = new URL(url);
        if (mapped.hostname !== 'opencritic.com') {
            throw new Error('Not mappable');
        }

        return mapped.href;
    }
}
