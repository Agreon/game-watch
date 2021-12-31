import { withBrowser } from "@game-watch/service";
import { InfoSourceType, StorePriceInformation, SwitchGameData } from "@game-watch/shared";
import axios from "axios";

import { InfoResolver } from "../resolve-service";
import { parseCurrencyValue } from "../util/parse-currency-value";

export interface SwitchSearchResponse {
    response: {
        numFound: number;
        docs: Array<{
            url: string;
            title: string;
            pretty_date_s: string;
            price_discounted_f?: number;
            price_regular_f?: number;
            image_url_h2x1_s: string;
        }>
    }
}

export const getSwitchSearchResponse = async (search: string) => {
    const { data: { response } } = await axios.get<SwitchSearchResponse>(
        `https://searching.nintendo-europe.com/de/select?q=${search}&fq=type:GAME AND ((playable_on_txt:"HAC")) AND sorting_title:* AND *:*&sort=score desc, date_from desc&start=0&rows=1&bf=linear(ms(priority%2CNOW%2FHOUR)%2C1.1e-11%2C0)`
    );

    return response;
};

export class SwitchResolver implements InfoResolver {
    public type = InfoSourceType.Switch;

    public async resolve(id: string): Promise<SwitchGameData> {
        return await withBrowser(async (page) => {
            // TODO: Does not accept special chars " "
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
                        initial: game.price_regular_f,
                        final: game.price_discounted_f ?? game.price_regular_f
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
                priceInformation: this.getPriceInformation({ price, salePrice }),
                releaseDate,
            };
        });
    }

    private getPriceInformation({ price, salePrice }: Record<string, any>): StorePriceInformation | undefined {
        const final = parseCurrencyValue(salePrice || price);
        // We consider a missing final value as failure
        if (!final) {
            return undefined;
        }

        return {
            initial: parseCurrencyValue(price),
            final,
        };
    }
}
