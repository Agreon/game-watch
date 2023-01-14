import { BaseGameData, InfoSourceType } from '@game-watch/shared';
import { AxiosInstance } from 'axios';

import { InfoSearcher, InfoSearcherContext } from '../search-service';
import { findBestMatch } from '../util/find-best-match';
import { matchingName } from '../util/matching-name';

export class ProtonSearcher implements InfoSearcher {
    public type = InfoSourceType.Proton;

    public constructor(private readonly axios: AxiosInstance) { }

    public async search(
        search: string,
        { logger }: InfoSearcherContext,
    ): Promise<BaseGameData | null> {
        const { data: { results: [{ hits }] } } = await this.axios.post(
            'https://94he6yatei-3.algolianet.com/1/indexes/steamdb/query',
            // {
            //     'query': search,
            //     'attributesToHighlight': [],
            //     'attributesToSnippet': [],
            //     'facets': ['tags'],
            //     'facetFilters': [['appType:Game']],
            //     'hitsPerPage': 5,
            //     'attributesToRetrieve': [
            //         'name',
            //         'objectID',
            //     ],
            //     'page': 0
            // },
            {
                'query': search,
                'attributesToHighlight': [],
                'attributesToSnippet': [],
                'facets': ['tags'],
                'facetFilters': [['appType:Game']],
                'hitsPerPage': 50,
                'attributesToRetrieve': ['lastUpdated', 'name', 'objectID', 'followers', 'oslist', 'releaseYear', 'tags', 'technologies', 'userScore'],
                'page': 0,
            }
            , {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'x-algolia-api-key': '9ba0e69fb2974316cdaec8f5f257088f',
                    'x-algolia-application-id': '94HE6YATEI'
                }
            }
        );

        if (!hits.length) {
            logger.debug('No results found');

            return null;
        }

        const {
            name,
            objectID,
        } = findBestMatch<{ name: string, objectID: string }>(search, hits, 'name');

        if (!matchingName(name, search)) {
            logger.debug(
                `Found name '${name}' does not include search '${search}'. Skipping`
            );

            return null;
        }

        logger.debug(`Found gameId '${objectID}'`);

        return {
            id: objectID,
            fullName: name,
            url: `https://www.protondb.com/app/${objectID}`,
        };
    }
}
