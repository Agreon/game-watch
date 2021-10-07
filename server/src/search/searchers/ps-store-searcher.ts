import { InfoSearcher } from "../search-service";
import { InfoSourceType } from "../../game/info-source-model";
import { withBrowser } from "../../util/with-browser";

export class PsStoreSearcher implements InfoSearcher {
    public type = InfoSourceType.PsStore;

    public async search(name: string) {
        console.time("Visit Ps Store");

        return await withBrowser(async (page) => {
            await page.goto(
                `https://store.playstation.com/en-gb/search/${encodeURIComponent(name)}/`
            );

            await page.waitForSelector(".psw-content-link");

            const href = await page.$eval(".psw-content-link", (el) => el.getAttribute("href"));

            console.timeEnd("Visit Ps Store");

            return `https://store.playstation.com/${href}`;
        })
    }
}