import { InfoSourceType, SwitchGameData } from "game-watch-shared";

import { getSwitchSearchResponse } from "../../search/searchers/switch-searcher";
import { withBrowser } from "../../util/with-browser";
import { InfoResolver } from "../resolve-service";

export class SwitchResolver implements InfoResolver {
    public type = InfoSourceType.Switch;

    public async resolve(id: string): Promise<SwitchGameData> {

        return await withBrowser(async (page) => {
            // TODO: Does not accept special chars
            if (!id.includes("/")) {
                // Just reuse the same search because we have all info there
                const { docs: results } = await getSwitchSearchResponse(id);

                const game = results[0];

                return {
                    id,
                    url: `https://nintendo.de${game.url}`,
                    fullName: id,
                    thumbnailUrl: game.image_url_h2x1_s,
                    priceInformation: game.price_regular_f ? {
                        initial: `${game.price_regular_f}€`,
                        final: `${game.price_discounted_f ?? game.price_regular_f}€`,
                    } : undefined,
                    releaseDate: game.pretty_date_s,
                };

            }


            await page.goto(id);
            await page.waitForSelector(".release-date > dd");

            const fullName = await page.$eval(".game-title", (el) => el.textContent!.trim());
            const thumbnailUrl = await page.evaluate(() => document.querySelector(".hero-illustration > img")!.getAttribute("src")!);

            const price = await page.evaluate(() => document.querySelector('.price > .msrp')?.textContent?.trim());
            const salePrice = await page.evaluate(() => document.querySelector('.price > .sale-price')?.textContent?.trim());

            const releaseDate = await page.$eval(".release-date > dd", (el) => el.textContent?.trim());

            return {
                id,
                url: id,
                fullName,
                thumbnailUrl,
                priceInformation: price ? {
                    initial: price,
                    final: salePrice || price
                } : undefined,
                releaseDate,
            };
        });
    }
    public async mapUrlToId(url: string): Promise<string> {
        const { hostname } = new URL(url);
        if (hostname !== "www.nintendo.de") {
            throw new Error("Not mappable");
        }

        // TODO: We should crawl the site for deterministic results :/
        // https://www.nintendo.de/Spiele/Nintendo-Switch/Bayonetta-3-2045649.html
        // => Extracts Last part without stuff behind last-
        const urlParts = url.split("/");
        const idPart = urlParts[urlParts.length - 1];
        const idParts = idPart.split("-").slice(0, -1);

        return idParts.join(" ");
    }
}
