import { BaseGameData, InfoSourceType } from '@game-watch/shared';
import { AxiosInstance } from 'axios';

import { InfoSearcher, InfoSearcherContext } from '../search-service';
import { matchingName } from '../util/matching-name';

export interface SwitchSearchResponse {
    response: {
        numFound: number;
        docs: Array<{
            url: string;
            title: string;
            pretty_date_s: string;
            price_discounted_f?: number;
            price_regular_f?: number;
            image_url_h2x1_s: string;
        }>
    }
}

export class SwitchSearcher implements InfoSearcher {
    public type = InfoSourceType.Switch;

    public constructor(private readonly axios: AxiosInstance) { }

    public async search(
        search: string,
        { logger, userCountry }: InfoSearcherContext
    ): Promise<BaseGameData | null> {
        if (userCountry === 'NZ' || userCountry === 'AU') {
            return await this.searchInAUAndNZ(search, { logger, userCountry });
        }

        if ([
            'AT',
            'BE-FR',
            'BE-NL',
            'CH-DE',
            'CH-FR',
            'CH-IT',
            'DE',
            'ES',
            'FR',
            'GB',
            'IE',
            'IT',
            'NL',
            'PT',
            'RU',
            'ZA',
        ].includes(userCountry)) {
            // eg. CH-DE => chde
            let countryCode = userCountry.replace('-', '').toLowerCase();
            if (['GB', 'IE'].includes(userCountry)) {
                countryCode = 'en';
            }

            const { numFound, docs: results } = await this.getSwitchSearchResponse(
                search,
                countryCode
            );

            if (!numFound) {
                logger.debug('No search results found');

                return null;

            }

            const gameData = results[0];

            if (!matchingName(gameData.title, search)) {
                logger.debug(
                    `Found name '${gameData.title}' does not include search '${search}'. Skipping`
                );

                return null;
            }

            // eg. CH-DE => ch
            let code = userCountry.toLowerCase().split('-')[0];
            if (['GB', 'IE'].includes(userCountry)) {
                code = 'co.uk';
            }
            if (userCountry === 'ZA') {
                code = 'co.za';
            }

            const url = `https://www.nintendo.${code}${gameData.url}`;
            return {
                id: url,
                url,
                fullName: gameData.title
            };
        }

        return await this.searchInAmericas(search, { logger, userCountry });
    }

    private async searchInAmericas(
        search: string,
        { logger }: InfoSearcherContext
    ): Promise<BaseGameData | null> {
        const urlParams = new URLSearchParams({
            hitsPerPage: '5',
            offset: '0',
        });
        const { data: { results: [{ hits }] } } = await this.axios.post(
            'https://u3b6gr4ua3-dsn.algolia.net/1/indexes/*/queries',
            {
                requests: [{
                    indexName: 'store_all_products_en_us',
                    query: search,
                    params: urlParams.toString()
                }],
            },
            {
                headers: {
                    'x-algolia-api-key': 'a29c6927638bfd8cee23993e51e721c9',
                    'x-algolia-application-id': 'U3B6GR4UA3'
                }
            }
        );

        const result = hits.find(
            (
                { platformCode, topLevelCategoryCode, topLevelFilters }: {
                    platformCode: string;
                    topLevelCategoryCode: string;
                    topLevelFilters: string[];
                },
            ) => (
                platformCode === 'NINTENDO_SWITCH'
                && topLevelCategoryCode === 'GAMES'
                && topLevelFilters.includes('DLC') === false
            )
        );
        if (!result) {
            logger.debug('No results found');

            return null;
        }

        const { title, url } = result;

        if (!matchingName(title, search)) {
            logger.debug(
                `Found name '${title}' does not include search '${search}'. Skipping`
            );

            return null;
        }

        logger.debug(`Found gameId '${url}'`);

        return {
            id: url,
            fullName: title,
            url: `https://www.nintendo.com${url}`
        };
    }

    private async searchInAUAndNZ(
        search: string,
        { logger }: InfoSearcherContext
    ): Promise<BaseGameData | null> {
        const urlParams = new URLSearchParams({
            hitsPerPage: '5',
            page: '0',
            query: search
        });
        const { data: { results: [{ hits }] } } = await this.axios.post(
            'https://fmw57f6erv-dsn.algolia.net/1/indexes/*/queries',
            {
                requests: [{
                    indexName: 'prod_games',
                    params: urlParams.toString()
                }],
            },
            {
                headers: {
                    'x-algolia-api-key': '82705f954734e1cfb0e7285e2d5ca33f',
                    'x-algolia-application-id': 'FMW57F6ERV'
                }
            }
        );

        const result = hits.find(
            ({ fullURL }: { fullURL: string }) => fullURL.includes('nintendo-switch')
        );
        if (!result) {
            logger.debug('No results found');

            return null;
        }

        const { title, slug, fullURL } = result;

        if (!matchingName(title, search)) {
            logger.debug(
                `Found name '${title}' does not include search '${search}'. Skipping`
            );

            return null;
        }

        logger.debug(`Found gameId '${slug}'`);

        return {
            id: slug,
            fullName: title,
            url: `https://www.nintendo.com.au${fullURL}`
        };
    }

    public async getSwitchSearchResponse(search: string, countryCode: string) {
        const { data: { response } } = await this.axios.get<SwitchSearchResponse>(
            `https://searching.nintendo-europe.com/${countryCode}/select`,
            {
                params: {
                    q: search,
                    fq: `type:GAME AND sorting_title:* AND *:*`,
                    sort: 'score desc, date_from desc',
                    start: 0,
                    rows: 1,
                    bf: 'linear(ms(priority,NOW/HOUR),3.19e-11,0)'
                }
            }
        );

        return response;
    }
}
