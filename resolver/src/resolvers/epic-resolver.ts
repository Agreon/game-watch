import { EpicGameData, InfoSourceType, StorePriceInformation } from "@game-watch/shared";
import { AxiosInstance } from "axios";
import * as cheerio from 'cheerio';

import { InfoResolver, InfoResolverContext } from "../resolve-service";
import { parseCurrencyValue } from "../util/parse-currency-value";
import { parseDate } from "../util/parse-date";

export class EpicResolver implements InfoResolver {
    public type = InfoSourceType.Epic;

    public constructor(private readonly axios: AxiosInstance) { }

    public async resolve({ source }: InfoResolverContext): Promise<EpicGameData> {
        const { data } = await this.axios.get<string>(source.data.id);

        const $ = cheerio.load(data);

        const fullName = $("div[data-component=PDPTitleHeader] > span").first().text().trim();

        let price;
        const priceContainer = $("div[data-component=PriceLayout]").first().html();
        if (priceContainer) {
            const $priceContainer = cheerio.load(priceContainer);
            price = $priceContainer("span[data-component=Text]").last().text().trim();
        }

        const discountedFromPrice = $("div[data-component=PDPDiscountedFromPrice]").first().text().trim();
        const releaseDate = $("time").first().attr("datetime")?.trim();
        const thumbnailUrl = $("div[data-component=PDPSidebarLogo] img").attr("src");

        return {
            ...source.data,
            fullName,
            thumbnailUrl,
            releaseDate: parseDate(releaseDate, ["YYYY-MM-DD"]),
            originalReleaseDate: releaseDate,
            priceInformation: this.getPriceInformation({ price, discountedFromPrice, })
        };
    }

    private getPriceInformation({ price, discountedFromPrice }: Record<string, string | undefined>): StorePriceInformation | undefined {
        if (price === "Gratis") {
            return {
                final: 0
            };
        }

        const initial = parseCurrencyValue(discountedFromPrice || price);
        const final = parseCurrencyValue(price);

        if (!final || !initial) {
            return undefined;
        }

        return {
            initial,
            final,
        };
    }

}
