import { withBrowser } from '@game-watch/browser';
import { InfoSourceType } from '@game-watch/shared';

import { UrlMapper } from '../mapper-service';

interface Query {
    queryKey: Array<string | Array<string>>
}

export class EpicResolver implements UrlMapper {
    public type = InfoSourceType.Epic;

    public async mapUrlToId(url: string): Promise<string> {
        const mapped = new URL(url);
        if (mapped.hostname !== 'store.epicgames.com') {
            throw new Error('Not mappable');
        }

        return await withBrowser('en-US', async browser => {
            await browser.goto(url);
            const { queries } = await browser.evaluate(
                () => (window as any).__REACT_QUERY_INITIAL_QUERIES__
            );

            const catalogOfferQuery: Query = queries.find(
                ({ queryKey }: Query) => queryKey[0] === 'getCatalogOffer'
            );
            const offerId = catalogOfferQuery?.queryKey.find(
                key => Array.isArray(key) && key[0] === 'offerId'
            )?.[1];
            const sandboxId = catalogOfferQuery?.queryKey.find(
                key => Array.isArray(key) && key[0] === 'sandboxId'
            )?.[1];

            if (!offerId || !sandboxId) {
                throw new Error(`Could not find offerId or sandboxId for ${url}`);
            }

            return `${offerId},${sandboxId}`;
        });
    }
}
