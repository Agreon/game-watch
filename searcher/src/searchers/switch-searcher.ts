import { withBrowser } from '@game-watch/browser';
import { mapCountryCodeToAcceptLanguage } from '@game-watch/service';
import { BaseGameData, InfoSourceType } from '@game-watch/shared';
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

/*
*
* Similar:
* https://www.nintendo.se/
* https://www.nintendo.dk/
* https://www.nintendo.fi/
* https://www.nintendo.no/
* =>
* POST
https://www.nintendo.se/index.php?option=com_virtuemart_search&ajax=yes
limitstart=0&selectedtab=2&virtuemart_search_release_start=&virtuemart_search_release_end=&virtuemart_search_release_publisher=&virtuemart_search_release_developer=&vm_search_word=Mario&virtuemart_search_sortby=&virtuemart_search_sortdir=desc&limit=20&task=virtuemart_search_all
*
* https://www.nintendo.hu/
* https://www.nintendo.pl/
* https://www.mojenintendo.cz/
* https://www.nintendo.sk/
* https://www.nintendo.hu/
*
* https://www.cdmedia.gr/nintendo-support/?red_source=www.nintendo.gr
*
*/

/**
 * TH
 * https://www.nintendo.com/th/api/v1/games/all
 *
 * HK + TW
 * https://www.nintendo.com.hk/software/switch/
 * https://www.nintendo.com.hk/data/json/switch_software.json?979812931524=
 * https://www.nintendo.tw/software/switch/
 * https://www.nintendo.tw/data/json/switch_software.json?53828332842=
 * => Whats the number
 *
 * KR
 * https://www.nintendo.co.kr/search_software.php?globalSearch=Mario
 *
 * JP
 * https://search.nintendo.jp/nintendo_soft/auto_complete.json?opt_sshow=1&fq[]=(*:* -ssitu_s:(sales_termination not_found)) OR ( id:70050000031641 OR id:3676 OR id:ef5bf7785c3eca1ab4f3d46a121c1709 OR id:3347 OR id:3252 OR id:3082 OR id:eb9f0cddb93859d136c45e7064033636 OR id:52ae614e85d88158afb6f88cbd43d4f5 OR id:70670517efc94e7bb6b2f9a16747a63a OR id:70010000000026_2 )&c=9733277731357724&pt=E&opt_search=1&q=Mario
 *  or maybe
 *  https://www.nintendo.co.jp/search/?q=Mario
 */

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
        ].includes(userCountry)) {
            return await this.searchInEU(search, { logger, userCountry })
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
                // TODO: Extract params
                `https://search.nintendo.jp/nintendo_${userCountry.toLowerCase()}/search.json?limit=1&page=1&c=9633277730941627&q=Mario&opt_type=2&sort=hards asc, score`
            )

            return {
                id: result.url,
                url: result.url,
                fullName: result.titles.split("|")[0],
            }
        }

        throw new Error(`Unsupported userCountry '${userCountry}' supplied.`)
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

    private async searchInEU(
        search: string,
        { logger, userCountry }: InfoSearcherContext
    ): Promise<BaseGameData | null> {
        // eg. CH-DE => chde
        let countryCode = userCountry.replace("-", "").toLowerCase();
        if (["GB", "IE"].includes(userCountry)) {
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
        if (["GB", "IE"].includes(userCountry)) {
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

    /**
     * https://www.nintendo.com/es-pe/
     * https://www.nintendo.com/es-cl/
     * https://www.nintendo.com/es-ar/
     * https://www.nintendo.com/es-co/
     * https://www.nintendo.com/pt-br/
     * https://www.nintendo.com/es-mx/
     * https://www.nintendo.com/fr-ca/
     * https://www.nintendo.com/en-ca/
     * TODO: Age verification?
     */
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
