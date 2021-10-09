import { Logger } from "@nestjs/common";
import { InfoSourceType } from "../../info-source/info-source-model";
import { matchingName } from "../../util/matching-name";
import { withBrowser } from "../../util/with-browser";
import { InfoSearcher } from "../search-service";

export class NintendoSearcher implements InfoSearcher {
    public type = InfoSourceType.Nintendo;
    private logger = new Logger(NintendoSearcher.name);

    public async search(search: string) {
        console.time("Visit Nintendo");

        return await withBrowser(async browser => {
            await browser.goto(`https://www.nintendo.com/games/game-guide/#filter/:q=${encodeURIComponent(search)}`);
            await browser.waitForSelector(".result-count");
            console.timeEnd("Visit Nintendo");

            const resultCount = await browser.$eval(".result-count", el => el.innerHTML);
            if (resultCount.includes("0 results")) {
                this.logger.debug("No results found");

                return null;
            }

            const gameTileLink = await browser.$eval("game-tile", el => el.getAttribute("href"));
            const fullName = await browser.$eval("game-tile > h3", el => el.textContent!.trim());

            if (!matchingName(fullName, search)) {
                this.logger.debug(`Found name '${fullName}' does not include search '${search}'. Skipping nintendo`);

                return null;
            }


            this.logger.debug(`Found link to game '${gameTileLink}'`);

            return `https://www.nintendo.com${gameTileLink}`;
        })
    }
}