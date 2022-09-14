import { withBrowser } from "@game-watch/browser";
import { mapCountryCodeToAcceptLanguage } from "@game-watch/service";
import { InfoSourceType, StorePriceInformation, SwitchGameData } from "@game-watch/shared";
import { AxiosInstance } from "axios";
import * as cheerio from 'cheerio';

import { InfoResolver, InfoResolverContext } from "../resolve-service";
import { parseCurrencyValue } from "../util/parse-currency-value";
import { parseDate } from "../util/parse-date";

const extract = (content: string, regex: RegExp) => {
    const result = new RegExp(regex).exec(content);

    return result ? result[0] : undefined;
};

export class SwitchResolver implements InfoResolver {
    public type = InfoSourceType.Switch;

    public constructor(private readonly axios: AxiosInstance) { }

    public async resolve({ userCountry, source }: InfoResolverContext): Promise<SwitchGameData> {
        if (userCountry === "US") {
            return await withBrowser(mapCountryCodeToAcceptLanguage(userCountry), async page => {
                await page.goto(source.data.id);
                await page.waitForSelector(".release-date > dd");

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const fullName = await page.$eval(".game-title", (el) => el.textContent!.trim());

                const thumbnailUrl = await page.evaluate(() => document.querySelector(".hero-illustration > img")!.getAttribute("src")!);

                const originalPrice = await page.evaluate(() => document.querySelector('.price > .msrp')?.textContent?.trim());
                const price = await page.evaluate(() => document.querySelector('.price > .sale-price')?.textContent?.trim());

                const releaseDate = await page.$eval(".release-date > dd", (el) => el.textContent?.trim());

                return {
                    ...source.data,
                    fullName,
                    thumbnailUrl,
                    releaseDate: parseDate(releaseDate, ["DD.MM.YYYY"]),
                    originalReleaseDate: releaseDate,
                    priceInformation: this.getPriceInformationForUsStore({ price, originalPrice }),
                };

            });
        }
        const { data } = await this.axios.get<string>(source.data.id);
        const $ = cheerio.load(data);

        const thumbnailUrl = $("meta[property='og:image']").first().attr("content");

        const releaseDate = extract(data, /(?<=Erscheinungsdatum: )[\d.]+/);

        return {
            ...source.data,
            thumbnailUrl,
            releaseDate: parseDate(releaseDate, ["DD.MM.YYYY"]),
            originalReleaseDate: releaseDate,
            priceInformation: await this.getPriceInformation(data),
        };
    }

    private async getPriceInformation(pageContents: string): Promise<StorePriceInformation | undefined> {
        const priceId = extract(pageContents, /(?<=offdeviceNsuID": ").\d+/);
        if (!priceId) {
            return undefined;
        }

        const { data } = await this.axios.get<any>(`https://api.ec.nintendo.com/v1/price?country=DE&lang=de&ids=${priceId}`);
        const { regular_price, discount_price } = data.prices[0];

        const initial = parseCurrencyValue(regular_price.raw_value);
        const final = parseCurrencyValue((discount_price || regular_price).raw_value);

        if (initial === undefined || final === undefined) {
            return undefined;
        }

        return {
            initial,
            final,
        };
    }

    // TODO: Free games?
    private getPriceInformationForUsStore({ price, originalPrice }: Record<string, any>,): StorePriceInformation | undefined {
        const initial = parseCurrencyValue(originalPrice || price);
        const final = parseCurrencyValue(price);

        if (!initial || !final) {
            return undefined;
        }

        return {
            initial,
            final,
        };
    }
}
