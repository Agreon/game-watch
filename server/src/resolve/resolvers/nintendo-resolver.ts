import { InfoSourceType, NintendoGameData } from "../../info-source/info-source-model";
import { getNintendoSearchResponse } from "../../search/searchers/nintendo-searcher";
import { withBrowser } from "../../util/with-browser";
import { InfoResolver } from "../resolve-service";

export class NintendoResolver implements InfoResolver {
    public type = InfoSourceType.Nintendo;

    public async resolve(id: string): Promise<NintendoGameData> {
        console.time("Resolve Nintendo");

        return await withBrowser(async (page) => {
            if (!id.includes("/")) {
                // Just reuse the same search because we have all info there
                const { docs: results } = await getNintendoSearchResponse(id);
                console.timeEnd("Resolve Nintendo");

                const game = results[0];

                return {
                    id,
                    storeUrl: `https://nintendo.de${game.url}`,
                    fullName: id,
                    thumbnailUrl: game.image_url_h2x1_s,
                    priceInformation: game.price_regular_f ? {
                        initial: `${game.price_regular_f} €`,
                        final: `${game.price_discounted_f ?? game.price_regular_f} €`,
                    } : undefined,
                    releaseDate: game.pretty_date_s,
                };

            }


            await page.goto(id);
            await page.waitForSelector(".release-date > dd");

            console.timeEnd("Resolve Nintendo");

            const fullName = await page.$eval(".game-title", (el) => el.textContent!.trim());
            const thumbnailUrl = await page.evaluate(() => document.querySelector(".hero-illustration > img")!.getAttribute("src")!);

            const price = await page.evaluate(() => document.querySelector('.price > .msrp')?.textContent?.trim());
            const salePrice = await page.evaluate(() => document.querySelector('.price > .sale-price')?.textContent?.trim());

            const releaseDate = await page.$eval(".release-date > dd", (el) => el.textContent?.trim());

            return {
                id,
                storeUrl: id,
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
