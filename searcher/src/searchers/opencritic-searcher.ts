import { InfoSourceType } from '@game-watch/shared';
import { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';

import { InfoSearcher, InfoSearcherContext } from '../search-service';
import { matchingName } from '../util/matching-name';

interface SearchResponse {
    name: string;
    id: number;
}

export class OpenCriticSearcher implements InfoSearcher {
    public type = InfoSourceType.OpenCritic;

    public constructor(private readonly axios: AxiosInstance) { }

    public async search(search: string, { logger }: InfoSearcherContext) {
        const {
            data: results
        } = await this.axios.get<SearchResponse[]>(
            `https://api.opencritic.com/api/meta/search`,
            {
                headers: {
                    'Origin': 'https://opencritic.com',
                    'accept': 'application/json, text/plain, */*',
                    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
                    'Referer': 'https://opencritic.com/',
                },
                params: {
                    criteria: encodeURIComponent(search),
                }
            }
        );

        const { id: gameId, name: fullName } = results[0];

        if (!matchingName(fullName, search)) {
            logger.debug(`Found name '${fullName}' does not include search '${search}'. Skipping`);

            return null;
        }

        logger.debug(`Found gameId '${gameId}'`);

        const slug = fullName.toLowerCase().replace(/ /g, '-').replace(/[:]/g, '');
        const url = `https://opencritic.com/game/${gameId}/${slug}`;

        const { data } = await this.axios.get<string>(url);
        const $ = cheerio.load(data);
        const score = $('.score-orb > .inner-orb');
        if(!score) {
            logger.debug(`No score found for ${fullName}`);
            return null;
        }

        return {
            id: url,
            url,
            fullName,
        };
    }
}
