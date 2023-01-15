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

        const { data: { hits } } = await this.axios.post(
            'https://94he6yatei-3.algolianet.com/1/indexes/steamdb/query',
            {
                'query': search,
                'facetFilters': [['appType:Game']],
                'hitsPerPage': 5,
                'attributesToRetrieve': [
                    'name',
                    'objectID',
                    'userScore'
                ],
                'page': 0
            },
            {
                headers: {
                    'x-algolia-api-key': '9ba0e69fb2974316cdaec8f5f257088f',
                    'x-algolia-application-id': '94HE6YATEI',
                    'Origin': 'https://www.protondb.com'
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
            userScore
        } = findBestMatch<{ name: string, objectID: string, userScore: number | null }>(
            search,
            hits,
            'name',
        );

        if (!matchingName(name, search)) {
            logger.debug(
                `Found name '${name}' does not include search '${search}'. Skipping`
            );

            return null;
        }

        if (userScore === null) {
            logger.debug(`Found '${name}' does not have a rating yet. Skipping`);

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
