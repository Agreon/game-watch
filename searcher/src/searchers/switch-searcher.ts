import { withBrowser } from '@game-watch/browser';
import { mapCountryCodeToAcceptLanguage } from '@game-watch/service';
import { BaseGameData, Country, InfoSourceType } from '@game-watch/shared';
import { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';

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

/**
 * china?
 * => No search? No prices?
 *
 * Maybe resolve all in eshop?
 * https://ec.nintendo.com/US/en/titles/70070000001541
 */


/**
 * These are countries whose store page doesn't give away enough information.
 * So we will use the search results of the UK store and later retrieve the price
 * information with the eshop API call.
 */
const COUNTRIES_WITHOUT_RESOLVE_PAGE: Country[] = [
    "SE",
    "DK",
    "NO",
    "FI",
    "HU",
    "PL",
    "CZ",
    "SK",
    "GR",
    "HR",
    "BG",
    "SL",
    "RO",
    "SR"
];

export class SwitchSearcher implements InfoSearcher {
    public type = InfoSourceType.Switch;

    public constructor(private readonly axios: AxiosInstance) { }

    public async search(
        search: string,
        { logger, userCountry }: InfoSearcherContext
    ): Promise<BaseGameData | null> {
        if ([
            "AT",
            "BE-FR",
            "BE-NL",
            "CH-DE",
            "CH-FR",
            "CH-IT",
            "DE",
            "ES",
            "FR",
            "GB",
            "IE",
            "IT",
            "NL",
            "PT",
            "RU",
            "ZA",
            ...COUNTRIES_WITHOUT_RESOLVE_PAGE,
        ].includes(userCountry)) {
            return await this.searchInEurope(search, { logger, userCountry })
        }

        if ([
            'US',
            "EN-CA",
            "ES-AR",
            "ES-CL",
            "ES-CO",
            "ES-MX",
            "ES-PE",
            "FR-CA",
            "PT-BR",
        ].includes(userCountry)) {
            return await this.searchInAmericas(search, { logger, userCountry })
        }

        if (userCountry === "NZ" || userCountry === "AU") {
            return await this.searchInAUAndNZ(search, { logger, userCountry })
        }

        if ([
            "PH",
            "MY",
            "SG"
        ].includes(userCountry)) {
            const { data: { result: { items: [result] } } } = await this.axios.get(
                `https://search.nintendo.jp/nintendo_${userCountry.toLowerCase()}/search.json`,
                {
                    params: {
                        limit: 1,
                        page: 1,
                        c: "9633277730941627",
                        q: search,
                        opt_type: 2,
                        sort: "hards asc, score"
                    }
                }
            )

            const fullName = result.title.split("|")[0];
            if (!matchingName(fullName, search)) {
                logger.debug(
                    `Found name '${fullName}' does not include search '${search}'. Skipping`
                );

                return null;
            }

            return {
                id: result.url,
                url: result.url,
                fullName,
            }
        }

        if (userCountry === "TH") {
            const { data: { result: { items } } } = await this.axios.get(
                "https://www.nintendo.com/th/api/v1/games/all"
            );
            // TODO: Cache items
            /**
             * 	"releaseDate": "2022-09-09T00:00:00.000Z",
                "softPageUrl": "/switch/av5j/",
                "common": {
                    "title": "Splatoon™ 3",
                    "nsuid": "70010000046395",
             */

            let matchingItem = { item: null, matches: 0 };
            for (const item of items) {

            }
            // Resolve
            // => https://www.nintendo.com/th/api/v1/switch/av5j
            // => No price
        }

        if (userCountry === "KR") {
            const { data } = await this.axios.get<string>(
                "https://www.nintendo.co.kr/search_software.php",
                { params: { globalSearch: search } }
            )
            const $ = cheerio.load(data);

            const fullName = $(".tit").text().trim();
            const link = $(".thumb").attr("href")!.trim();
            const id = link.split("/")[link.split("/").length - 1];


            if (!matchingName(fullName, search)) {
                logger.debug(
                    `Found name '${fullName}' does not include search '${search}'. Skipping`
                );

                return null;
            }

            return {
                id,
                url: link,
                fullName,
            }

        }

        if (userCountry === "JP") {
            const { data: { item: [result] } } = await this.axios.get(
                "https://search.nintendo.jp/nintendo_soft/auto_complete.json",
                {
                    params: {
                        q: search,
                        pt: "E",
                        opt_search: 1,
                    }
                }
            )

            if (!matchingName(result.title, search)) {
                logger.debug(
                    `Found name '${result.title}' does not include search '${search}'. Skipping`
                );

                return null;
            }

            return {
                id: result.nsuid,
                url: result.url,
                fullName: result.title
            }
        }

        if (["HK", "TW"].includes(userCountry)) {
            const { data: results } = await this.axios.get(
                `https://www.nintendo.${userCountry === 'HK' ? "com.hk" : "tw"}/data/json/switch_software.json`
            );
            // TODO: Cache Items
            // TODO: Search

            const foundItem = {
                title: "《哆啦A夢 牧場物語 自然王國與和樂家人》數位豪華版",
                link: "https://store.nintendo.com.hk/70070000015153",
            }

            return {
                id: foundItem.link,
                url: foundItem.link,
                fullName: foundItem.title.trim(),
            }
        }


        throw new Error(`Unsupported userCountry '${userCountry}' supplied.`)
    }


    private async searchInEurope(
        search: string,
        { logger, userCountry }: InfoSearcherContext
    ): Promise<BaseGameData | null> {
        // eg. CH-DE => chde
        let countryCode = userCountry.replace("-", "").toLowerCase();
        if (["GB", "IE", ...COUNTRIES_WITHOUT_RESOLVE_PAGE].includes(userCountry)) {
            countryCode = "en";
        }

        const { data: { response: { numFound, docs: results } } } = await this.axios.get<SwitchSearchResponse>(
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

        // eg. CH-DE => ch/de
        let code = userCountry.toLowerCase().replace("-", "/")
        if (["GB", "IE", ...COUNTRIES_WITHOUT_RESOLVE_PAGE].includes(userCountry)) {
            code = "co.uk";
        }
        if (userCountry === "ZA") {
            code = "co.za";
        }

        const url = `https://nintendo.${code}${gameData.url}`;
        return {
            id: url,
            url,
            fullName: gameData.title
        };
    }

    private async searchInAUAndNZ(
        search: string,
        { logger, userCountry }: InfoSearcherContext
    ): Promise<BaseGameData | null> {
        const lang = userCountry === "AU" ? "au" : "nz";

        const { data } = await this.axios.get(
            `https://store.nintendo.com.au/${lang}/eshopsearch/result/?q=${encodeURIComponent(search)}`
        )
        const $ = cheerio.load(data);

        const url = $(".product-item-link").attr("href")!;
        const id = url.split("/")[url.split("/").length - 1];
        const fullName = $(".product-item-link").text().trim()

        if (!matchingName(fullName, search)) {
            logger.debug(`Found name '${fullName}' does not include search '${search}'. Skipping`);

            return null;
        }

        logger.debug(`Found gameId '${id}'`);

        return {
            id,
            url,
            fullName,
        };
    }

    private async searchInAmericas(
        search: string,
        { logger, userCountry }: InfoSearcherContext
    ): Promise<BaseGameData | null> {
        return await withBrowser(mapCountryCodeToAcceptLanguage(userCountry), async page => {
            const countryCode = userCountry === "US" ? "" : `/${userCountry.toLowerCase()}`
            await page.goto(`https://www.nintendo.com/search${countryCode}/?q=${encodeURIComponent(search)}&p=1&cat=gme&sort=df&f=corePlatforms&corePlatforms=Nintendo+Switch`);

            const raceResult = await Promise.race([
                page.waitForXPath(`//a[contains(@href,"nintendo.com${countryCode}/store/products/")]`),
                (async () => {
                    // TODO: Wont work anymore :/
                    await page.waitForXPath('//h1[contains(text(),"return any results")]');
                    return null;
                })(),

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


}
