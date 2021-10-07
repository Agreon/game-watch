import { InfoSearcher } from "../search-service";
import { InfoSourceType } from "../../game/info-source-model";
import { withBrowser } from "../../util/with-browser";
import { Logger } from "@nestjs/common";

export class PsStoreSearcher implements InfoSearcher {
    public type = InfoSourceType.PsStore;
    private logger = new Logger(PsStoreSearcher.name);

    public async search(name: string) {
        console.time("Visit Ps Store");

        return await withBrowser(async browser => {
            await browser.goto(
                `https://store.playstation.com/en-gb/search/${encodeURIComponent(name)}/`
            );
            console.timeEnd("Visit Ps Store");

            const content = await browser.content()
            if (content.includes("No results found")) {
                this.logger.debug("No results found");

                return null;
            }

            await browser.waitForSelector(".psw-content-link");

            const href = await browser.$eval(".psw-content-link", (el) => el.getAttribute("href"));

            this.logger.debug(`Found link to game '${href}'`);

            return `https://store.playstation.com${href}`;
        })
    }
}