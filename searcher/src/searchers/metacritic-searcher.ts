import { mapCountryCodeToAcceptLanguage } from '@game-watch/service';
import { BaseGameData, InfoSourceType } from '@game-watch/shared';
import { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';

import { InfoSearcher, InfoSearcherContext } from '../search-service';
import { matchingName } from '../util/matching-name';

export class MetacriticSearcher implements InfoSearcher {
    public type = InfoSourceType.Metacritic;

    public constructor(private readonly axios: AxiosInstance) { }

    public async search(
        search: string,
        { logger, userCountry }: InfoSearcherContext
    ): Promise<BaseGameData | null> {
        const { data } = await this.axios.get<string>(
            `https://www.metacritic.com/search/game/${search}/results`,
            {
                headers: { 'Accept-Language': mapCountryCodeToAcceptLanguage(userCountry) }
            }
        );

        const $ = cheerio.load(data);

        const resultRow = $('.first_result a');
        if (!resultRow.length) {
            logger.debug('No results found');

            return null;
        }

        const gameLink = resultRow.attr('href');
        if (!gameLink) {
            return null;
        }

        const fullName = resultRow.text().trim();
        if (!matchingName(fullName, search)) {
            logger.debug(`Found name '${fullName}' does not include search '${search}'. Skipping`);

            return null;
        }

        const criticScore = $('.main_stats > .metascore_w').text().trim();
        if (isNaN(parseInt(criticScore))) {
            logger.debug(`Found score '${fullName}' is not a number. Skipping`);

            return null;
        }

        const url = `https://www.metacritic.com${gameLink}`;

        return {
            id: url,
            url,
            fullName,
        };

    }
}
