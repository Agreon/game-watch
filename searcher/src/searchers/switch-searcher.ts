import { withBrowser } from "@game-watch/browser";
import { mapCountryCodeToAcceptLanguage } from "@game-watch/service";
import { InfoSourceType } from "@game-watch/shared";
import axios from "axios";

import { InfoSearcher, InfoSearcherContext, SearchResponse } from "../search-service";
import { matchingName } from "../util/matching-name";

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

export const getSwitchSearchResponse = async (search: string) => {
    const { data: { response } } = await axios.get<SwitchSearchResponse>(
        'https://searching.nintendo-europe.com/de/select',
        {
            params: {
                q: search,
                fq: `type:GAME AND ((playable_on_txt:"HAC")) AND sorting_title:* AND *:*&sort=score desc, date_from desc`,
                start: 0,
                rows: 1,
                bf: 'linear(ms(priority,NOW/HOUR),1.1e-11,0)'
            }
        }
    );

    return response;
};

export class SwitchSearcher implements InfoSearcher {
    public type = InfoSourceType.Switch;


    public async search(search: string, { logger, userCountry }: InfoSearcherContext): Promise<SearchResponse | null> {
        if (userCountry === "DE") {
            const { numFound, docs: results } = await getSwitchSearchResponse(search);

            if (!numFound) {
                logger.debug("No search results found");

                return null;

            }

            const gameData = results[0];

            if (!matchingName(gameData.title, search)) {
                logger.debug(`Found name '${gameData.title}' does not include search '${search}'. Skipping`);

                return null;
            }

            return {
                remoteGameId: `https://nintendo.de${gameData.url}`,
                remoteGameName: gameData.title
            };
        }


        return await withBrowser(mapCountryCodeToAcceptLanguage(userCountry), async browser => {
            await browser.goto(`https://www.nintendo.com/search/?q=${encodeURIComponent(search)}&p=1&cat=gme&sort=df&f=corePlatforms&corePlatforms=Nintendo+Switch`);


            // TODO: No result count... "didn't return any results" .ResultsForstyles__StyledText-sc-17gvq2y-1 JubOL

            await browser.waitForSelector(".result-count");



            const resultCount = await browser.$eval(".result-count", el => el.innerHTML);
            if (resultCount.includes("0 results")) {
                logger.debug("No results found");

                return null;
            }

            /**
             * <div class="BasicTilestyles__TileUpper-sc-sh8sf3-1 fBdUCk"><div class="BasicTilestyles__Flag-sc-sh8sf3-6 cfRPNH">Pre-order now</div><div class="BasicTilestyles__ImageFrame-sc-sh8sf3-10 krmGJS"><div class="KeyArtstyles__StyledFrame-sc-1u4ptmi-0 biyUsE"><div class="Imagestyles__ImageWrapper-sc-1oi2gnz-0 hJIeuB"><img role="presentation" alt="" class="Imagestyles__CloudinaryImage-sc-1oi2gnz-1 hFNlYD" src="https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/b_white/f_auto/q_auto/dpr_auto/c_scale,w_300/v1/ncom/en_US/games/switch/m/mario-strikers-battle-league-switch/hero"></div></div></div></div><div class="BasicTilestyles__TileLower-sc-sh8sf3-2 kvtdMj"><div class="BasicTilestyles__Info-sc-sh8sf3-7 eTYVYV"><div class="BasicTilestyles__TitleWrapper-sc-sh8sf3-13 fhSNtP"><h3 class="BasicTilestyles__Title-sc-sh8sf3-11 ka-dMDt">Mario Strikers™: Battle League</h3></div><div><div class="ProductTilestyles__PriceWrapper-sc-n2s21r-3 hYQUDk"><div class="Pricestyles__Price-sc-afjfk5-0 ixmoXq"><div class="Pricestyles__PriceWrapper-sc-afjfk5-8 eieoUb"><span class="Pricestyles__MSRP-sc-afjfk5-10 ffFFNE"><span class="ScreenReaderOnlystyles__StyledReaderText-sc-jiymtq-0 jhBEVo">Regular Price:</span>$59.99</span></div></div></div><div class="BasicTilestyles__Row-sc-sh8sf3-12 dbOzbk"><div class="PlatformLabelstyles__StyledPlatform-sc-1cn94zq-0 gdPjDq"><span>Nintendo Switch</span></div></div></div></div></div>
             */


            const gameLink = await browser.$eval("game-tile", el => el.getAttribute("href"));
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const fullName = await browser.$eval("game-tile > h3", el => el.textContent!.trim());

            if (!matchingName(fullName, search)) {
                logger.debug(`Found name '${fullName}' does not include search '${search}'. Skipping`);

                return null;
            }

            return {
                remoteGameId: `https://nintendo.com${gameLink}`,
                remoteGameName: fullName
            };
        });
    }
}
