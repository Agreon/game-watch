import { Logger } from "@nestjs/common";
import { InfoSourceType } from "../../game/info-source-model";
import { withBrowser } from "../../util/with-browser";
import { InfoSearcher } from "../search-service";


export class NintendoSearcher implements InfoSearcher {
    public type = InfoSourceType.Nintendo;
    private logger = new Logger(NintendoSearcher.name);

    public async search(name: string) {
        console.time("Visit Nintendo");

        return await withBrowser(async (page) => {
            await page.goto(`https://www.nintendo.com/games/game-guide/#filter/:q=${encodeURIComponent(name)}`);
            await page.waitForSelector(".result-count");
            console.timeEnd("Visit Nintendo");

            const resultCount = await page.$eval(".result-count", el => el.innerHTML);
            if (resultCount.includes("0 results")) {
                this.logger.debug("No results found");

                return null;
            }

            const gameTileLink = await page.$eval("game-tile", el => el.getAttribute("href"));

            this.logger.debug(`Found link to game '${gameTileLink}'`);

            return `https://www.nintendo.com${gameTileLink}`;
        })
    }
}