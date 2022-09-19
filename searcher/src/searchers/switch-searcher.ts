import { withBrowser } from '@game-watch/browser';
import { mapCountryCodeToAcceptLanguage } from '@game-watch/service';
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
        if (userCountry === 'DE') {
            const { numFound, docs: results } = await this.getSwitchSearchResponse(search);

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

            const url = `https://nintendo.de${gameData.url}`;
            return {
                id: url,
                url,
                fullName: gameData.title
            };
        }

        return await withBrowser(mapCountryCodeToAcceptLanguage(userCountry), async page => {
            await page.goto(`https://www.nintendo.com/search/?q=${encodeURIComponent(search)}&p=1&cat=gme&sort=df&f=corePlatforms&corePlatforms=Nintendo+Switch`);

            const raceResult = await Promise.race([
                page.waitForXPath('//a[contains(@href,"nintendo.com/store/products/")]'),
                (async () => {
                    await page.waitForXPath('//h1[contains(text(),"return any results")]');
                    return null;
                })()
            ]);
            if (!raceResult) {
                logger.debug('No results found');

                return null;
            }

            const url = await (await raceResult.getProperty('href')).jsonValue() as string;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const fullName = await raceResult.$eval('h3', el => el.textContent!.trim());

            if (!matchingName(fullName, search)) {
                logger.debug(
                    `Found name '${fullName}' does not include search '${search}'. Skipping`
                );

                return null;
            }

            return {
                id: url,
                url,
                fullName
            };
        });
    }

    public async getSwitchSearchResponse(search: string) {
        const { data: { response } } = await this.axios.get<SwitchSearchResponse>(
            'https://searching.nintendo-europe.com/de/select',
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
