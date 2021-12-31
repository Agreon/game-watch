import { withBrowser } from "@game-watch/service";
import { InfoSourceType } from "@game-watch/shared";

import { InfoSearcher, InfoSearcherContext } from "../search-service";
import { matchingName } from "../util/matching-name";

// TODO: Voice of cards finds addon pack for whatever reason?
export class PsStoreSearcher implements InfoSearcher {
    public type = InfoSourceType.PsStore;

    public async search(search: string, { logger }: InfoSearcherContext) {
        return await withBrowser(async browser => {
            await browser.goto(
                `https://store.playstation.com/de-de/search/${encodeURIComponent(search)}/`
            );

            const content = await browser.content();
            if (content.includes("search-no-results")) {
                logger.debug("No results found");

                return null;
            }

            await browser.waitForSelector(".psw-content-link");

            const href = await browser.$eval(".psw-content-link", (el) => el.getAttribute("href"));
            const fullName = await browser.$eval(
                'span[data-qa="search#productTile0#product-name"]',
                (el) => el.textContent!.trim()
            );

            if (!matchingName(fullName, search)) {
                logger.debug(`Found name '${fullName}' does not include search '${search}'. Skipping`);

                return null;
            }

            logger.debug(`Found link to game '${href}'`);

            return {
                remoteGameId: `https://store.playstation.com${href}`,
                remoteGameName: fullName,
            };
        });
    }
}
