import { withBrowser } from "@game-watch/service";
import { InfoSourceType, SwitchGameData } from "@game-watch/shared";

import { InfoResolver } from "../resolve-service";

export class SwitchResolver implements InfoResolver {
    public type = InfoSourceType.Switch;

    public async resolve(id: string): Promise<SwitchGameData> {

        return await withBrowser(async (page) => {
            // TODO: Does not accept special chars
            // if (!id.includes("/")) {
            //     // Just reuse the same search because we have all info there
            //     const { docs: results } = await getSwitchSearchResponse(id);

            //     const game = results[0];

            //     return {
            //         id,
            //         url: `https://nintendo.de${game.url}`,
            //         fullName: id,
            //         thumbnailUrl: game.image_url_h2x1_s,
            //         priceInformation: game.price_regular_f ? {
            //             initial: `${game.price_regular_f}€`,
            //             final: `${game.price_discounted_f ?? game.price_regular_f}€`,
            //         } : undefined,
            //         releaseDate: game.pretty_date_s,
            //     };

            // }


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
}
