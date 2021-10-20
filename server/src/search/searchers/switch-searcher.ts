import { Logger } from "@nestjs/common";
import axios from "axios";

import { InfoSourceType } from "../../info-source/info-source-model";
import { matchingName } from "../../util/matching-name";
import { withBrowser } from "../../util/with-browser";
import { InfoSearcher } from "../search-service";

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
        `https://searching.nintendo-europe.com/de/select?q=${search}&fq=type:GAME AND ((playable_on_txt:"HAC")) AND sorting_title:* AND *:*&sort=score desc, date_from desc&start=0&rows=1&bf=linear(ms(priority%2CNOW%2FHOUR)%2C1.1e-11%2C0)`
    );

    return response;
};

export class SwitchSearcher implements InfoSearcher {
    public type = InfoSourceType.Switch;
    private logger = new Logger(SwitchSearcher.name);

    public async search(search: string) {
        console.time("Visit Switch");
        const userLanguage = "de";

        return await withBrowser(async browser => {
            if (userLanguage === "de") {
                const { numFound, docs: results } = await getSwitchSearchResponse(search);

                console.timeEnd("Visit Switch");

                if (!numFound) {
                    this.logger.debug("No results found");

                    return null;

                }

                const gameData = results[0];

                if (!matchingName(gameData.title, search)) {
                    this.logger.debug(`Found name '${gameData.title}' does not include search '${search}'. Skipping switch`);

                    return null;
                }

                return gameData.title;
            }


            await browser.goto(`https://www.nintendo.com/games/game-guide/#filter/:q=${encodeURIComponent(search)}`);
            await browser.waitForSelector(".result-count");
            console.timeEnd("Visit Switch");

            const resultCount = await browser.$eval(".result-count", el => el.innerHTML);
            if (resultCount.includes("0 results")) {
                this.logger.debug("No results found");

                return null;
            }

            const gameLink = await browser.$eval("game-tile", el => el.getAttribute("href"));
            const fullName = await browser.$eval("game-tile > h3", el => el.textContent!.trim());

            if (!matchingName(fullName, search)) {
                this.logger.debug(`Found name '${fullName}' does not include search '${search}'. Skipping switch`);

                return null;
            }


            this.logger.debug(`Found link to game '${gameLink}'`);

            return `https://www.nintendo.com${gameLink}`;
        });
    }
}