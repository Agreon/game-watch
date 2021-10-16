import { Logger } from "@nestjs/common";

import { InfoSourceType } from "../../info-source/info-source-model";
import { matchingName } from "../../util/matching-name";
import { withBrowser } from "../../util/with-browser";
import { InfoSearcher } from "../search-service";

export class PsStoreSearcher implements InfoSearcher {
    public type = InfoSourceType.PsStore;
    private logger = new Logger(PsStoreSearcher.name);

    public async search(search: string) {
        console.time("Visit Ps Store");

        return await withBrowser(async browser => {
            await browser.goto(
                `https://store.playstation.com/de-de/search/${encodeURIComponent(search)}/`
            );
            console.timeEnd("Visit Ps Store");

            const content = await browser.content();
            if (content.includes("search-no-results")) {
                this.logger.debug("No results found");

                return null;
            }

            await browser.waitForSelector(".psw-content-link");

            const href = await browser.$eval(".psw-content-link", (el) => el.getAttribute("href"));
            const fullName = await browser.$eval(
                'span[data-qa="search#productTile0#product-name"]',
                (el) => el.textContent!.trim()
            );

            if (!matchingName(fullName, search)) {
                this.logger.debug(`Found name '${fullName}' does not include search '${search}'. Skipping PsStore`);

                return null;
            }

            this.logger.debug(`Found link to game '${href}'`);

            return `https://store.playstation.com${href}`;
        });
    }
}