import { InfoSourceType, NintendoGameData } from "../../game/info-source-model";
import { InfoResolver } from "../resolve-service";
import { withBrowser } from "../../util/with-browser";

export class NintendoResolver implements InfoResolver {
    public type = InfoSourceType.Nintendo;

    public async resolve(id: string): Promise<NintendoGameData> {
        console.time("Resolve Nintendo");

        return await withBrowser(async (page) => {
            await page.goto(id);

            // TODO: Test
            await page.waitForSelector(".release-date > dd");

            // TODO: We are too fast for the price sometimes
            // TODO: Price could be missing
            const price = await page.$eval(".price > .msrp", (el) => el.textContent?.trim());
            const releaseDate = await page.$eval(".release-date > dd", (el) => el.textContent?.trim());

            console.timeEnd("Resolve Nintendo");

            return {
                id,
                storeUrl: id,
                price: price || "",
                releaseDate: releaseDate || ""
            };
        })
    }
}