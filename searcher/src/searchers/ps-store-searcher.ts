import { withBrowser } from "@game-watch/browser";
import { mapCountryCodeToAcceptLanguage } from "@game-watch/service";
import { InfoSourceType } from "@game-watch/shared";

import { InfoSearcher, InfoSearcherContext } from "../search-service";
import { matchingName } from "../util/matching-name";

export class PsStoreSearcher implements InfoSearcher {
    public type = InfoSourceType.PsStore;

    public async search(search: string, { logger, userCountry }: InfoSearcherContext) {
        return await withBrowser(mapCountryCodeToAcceptLanguage(userCountry), async page => {
            await page.goto(`https://www.playstation.com/${mapCountryCodeToAcceptLanguage(userCountry).toLocaleLowerCase()}/search/?q=${search}`);

            const raceResult = await Promise.race([
                (async () => {
                    await page.waitForSelector(".search-results");
                    return 0;
                })(),
                (async () => {
                    await page.waitForSelector('.search__no-result > h3:not(:empty)');
                    return 1;
                })()
            ]);
            if (raceResult === 1) {
                return null;
            }

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const gameLink = await page.$eval(".search-results__tile", el => el.getAttribute("href")!);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const fullName = await page.$eval(".search-results__tile__content-title", el => el.textContent!.trim());

            if (!matchingName(fullName, search)) {
                logger.debug(`Found name '${fullName}' does not include search '${search}'. Skipping`);

                return null;
            }

            return {
                id: gameLink,
                url: gameLink,
                fullName
            };
        });
    }
}
