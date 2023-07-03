import { BaseGameData, InfoSourceType, parseStructure } from '@game-watch/shared';
import { AxiosInstance } from 'axios';
import * as t from 'io-ts';

import { InfoSearcher, InfoSearcherContext } from '../search-service';

const XboxSearchResponseStructure = t.type({
    ResultSets: t.array(t.type({
        Suggests: t.array(t.type({
            Source: t.string,
            Title: t.string,
            Url: t.string,
        }))
    }))
});

export class XboxSearcher implements InfoSearcher {
    public type = InfoSourceType.Xbox;

    public constructor(private readonly axios: AxiosInstance) { }

    public async search(search: string, { logger }: InfoSearcherContext): Promise<BaseGameData | null> {
        const { data: unknownData } = await this.axios.get(`https://www.microsoft.com/msstoreapiprod/api/autosuggest`,
            {
                params: {
                    market: 'en-us',
                    clientId: '7F27B536-CF6B-4C65-8638-A0F8CBDFCA65',
                    sources: 'xSearch-Products',
                    filter: '+ClientType:StoreWeb',
                    counts: '5,1,5',
                    query: search
                }
            });

        const results = parseStructure(XboxSearchResponseStructure, unknownData);

        if (!results.ResultSets.length || !results.ResultSets[0].Suggests.length) {
            logger.debug('No search results found');

            return null;
        }

        const gameResult = results.ResultSets[0].Suggests.find(({ Source }) => Source === 'Game');
        if (!gameResult) {
            logger.debug('No game results found');

            return null;
        }

        const { Title, Url } = gameResult;
        const url = Url.replace('//www.microsoft.com/en-us/store/p', 'https://www.xbox.com/en-us/games/store');

        return {
            id: url,
            fullName: Title,
            url,
        };
    }
}
