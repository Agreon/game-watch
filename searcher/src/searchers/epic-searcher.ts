import { retrieveEpicGameData, withBrowser } from '@game-watch/browser';
import {
    BaseGameData,
    InfoSourceType,
    mapCountryCodeToAcceptLanguage,
    parseStructure,
} from '@game-watch/shared';
import * as t from 'io-ts';

import { InfoSearcher, InfoSearcherContext } from '../search-service';
import { matchingName } from '../util/matching-name';

const EpicSearchQueryResponseStructure = t.type({
    data: t.type({
        Catalog: t.type({
            searchStore: t.type({
                elements: t.array(t.type({
                    offerId: t.string,
                    sandboxId: t.string,
                }))
            })
        })
    })
});

export class EpicSearcher implements InfoSearcher {
    public type = InfoSourceType.Epic;

    public async search(
        search: string,
        { logger, userCountry }: InfoSearcherContext
    ): Promise<BaseGameData | null> {
        const searchResult = await withBrowser(mapCountryCodeToAcceptLanguage(userCountry), async browser => {
            const searchParams = new URLSearchParams({
                operationName: 'primarySearchAutocomplete',
                variables: JSON.stringify({
                    category: 'games/edition/base|bundles/games|editors|software/edition/base|addons/launchable',
                    count: 1,
                    keywords: search,
                    country: userCountry.split('-')[0],
                    locale: 'en-US',
                    sortDir: 'DESC',
                }),
                extensions: JSON.stringify({
                    persistedQuery: {
                        version: 1,
                        sha256Hash: '531ca97218358754b2a3dade40dbbfc62e280d0173dcaf53305b3b3f3c393580',
                    },
                })
            });

            await browser.goto(`https://store.epicgames.com/graphql?${searchParams.toString()}`);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const unknownData = await browser.$eval('body', (el) => JSON.parse(el.textContent!));
            const validatedData = parseStructure(EpicSearchQueryResponseStructure, unknownData);

            return validatedData.data.Catalog.searchStore.elements[0];
        });

        if (!searchResult) {
            logger.debug('No results found');

            return null;
        }

        const gameData = await retrieveEpicGameData(
            searchResult.offerId,
            searchResult.sandboxId,
            userCountry.split('-')[0]
        );

        const fullName = gameData.title;
        if (!matchingName(fullName, search)) {
            logger.debug(`Found name '${fullName}' does not match search '${search}'. Skipping`);

            return null;
        }

        const slug = gameData.offerMappings[0]?.pageSlug ?? gameData.urlSlug;
        const url = `https://www.epicgames.com/p/${slug}`;

        return {
            id: `${searchResult.offerId},${searchResult.sandboxId}`,
            fullName,
            url,
        };
    }
}
