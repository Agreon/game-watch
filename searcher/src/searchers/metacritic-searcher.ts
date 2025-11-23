import { BaseGameData, InfoSourceType, parseStructure } from '@game-watch/shared';
import { AxiosInstance } from 'axios';
import * as t from 'io-ts';

import { InfoSearcher, InfoSearcherContext } from '../search-service';
import { findBestMatch } from '../util/find-best-match';
import { matchingName } from '../util/matching-name';

const MetacriticSearchApiResponseStructure = t.type({
    data: t.type({
        items: t.array(t.type({
            type: t.string,
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
	        `https://backend.metacritic.com/finder/metacritic/autosuggest/${encodeURIComponent(search)}`,
        );

        const parsedData = parseStructure(MetacriticSearchApiResponseStructure, unknownData);

        const games = parsedData.data.items.filter(({ type }) => type === 'game-title');

        const { title, slug, criticScoreSummary: { score } } = findBestMatch(search, games, 'title');
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
