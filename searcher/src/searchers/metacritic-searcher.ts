import { BaseGameData, InfoSourceType, parseStructure } from '@game-watch/shared';
import { AxiosInstance } from 'axios';
import * as t from 'io-ts';

import { InfoSearcher, InfoSearcherContext } from '../search-service';
import { matchingName } from '../util/matching-name';

const MetacriticApiGameComponentResponseDataStructure = t.type({
    data: t.type({
        totalResults: t.number,
        items: t.array(t.type({
            title: t.string,
            slug: t.string,
            criticScoreSummary: t.type({
                score: t.union([t.number, t.null])
            })
        }))
    })
});

export class MetacriticSearcher implements InfoSearcher {
    public type = InfoSourceType.Metacritic;

    public constructor(private readonly axios: AxiosInstance) { }

    public async search(
        search: string,
        { logger }: InfoSearcherContext
    ): Promise<BaseGameData | null> {
        const { data: unknownData } = await this.axios.get(
            `https://fandom-prod.apigee.net/v1/xapi/composer/metacritic/pages/search/${encodeURIComponent(search)}/web`,
            {
                params: {
                    apiKey: '1MOZgmNFxvmljaQR1X9KAij9Mo4xAY3u'
                }
            }
        );

        if (!unknownData.components || !unknownData.components[0] || !unknownData.components[0].data.totalResults) {
            logger.debug('No search results found');

            return null;
        }

        const parsedDate = parseStructure(MetacriticApiGameComponentResponseDataStructure, unknownData.components[0]);
        const { title, slug, criticScoreSummary: { score } } = parsedDate.data.items[0];

        if (!matchingName(title, search)) {
            logger.debug(`Found name '${title}' does not include search '${search}'. Skipping`);

            return null;
        }

        if (!score) {
            logger.debug(`Score is tbd. Skipping`);

            return null;
        }

        const url = `https://www.metacritic.com/game/${slug}`;

        return {
            id: url,
            url,
            fullName: title,
        };

    }
}
