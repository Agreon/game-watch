import { EpicGameData, InfoSourceType, StorePriceInformation } from "@game-watch/shared";
import axios from "axios";
import * as cheerio from 'cheerio';

import { InfoResolver } from "../resolve-service";
import { parseCurrencyValue } from "../util/parse-currency-value";
import { parseDate } from "../util/parse-date";

export class EpicResolver implements InfoResolver {
    public type = InfoSourceType.Epic;

    public async resolve(id: string): Promise<EpicGameData> {
        const { data } = await axios.get<string>(id);

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
            id,
            fullName,
            url: id,
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
