import axios from "axios";
import * as cheerio from 'cheerio';

import { EpicGameData, InfoSourceType } from "../../info-source/info-source-model";
import { InfoResolver } from "../resolve-service";

export class EpicResolver implements InfoResolver {
    public type = InfoSourceType.Epic;

    public async resolve(id: string): Promise<EpicGameData> {
        const { data } = await axios.get<string>(id);

        const $ = cheerio.load(data);

        const fullName = $("div[data-component=PDPTitleHeader] > span").first().text().trim();
        const discountedFromPrice = $("div[data-component=PDPDiscountedFromPrice]").text().trim();
        const price = $("div[data-component=PriceLayout] span[data-component=Text]").last().text().trim();
        const releaseDate = $("time").first().attr("datetime")?.trim();
        const thumbnailUrl = $("div[data-component=PDPSidebarLogo] img").attr("src");

        return {
            id,
            fullName,
            url: id,
            thumbnailUrl,
            releaseDate: releaseDate ?? "TBD",
            priceInformation: price !== "" ? {
                initial: discountedFromPrice ?? price,
                final: price,
            } : undefined
        };

    }

    public async mapUrlToId(url: string): Promise<string> {
        const { hostname } = new URL(url);
        if (hostname !== "www.epicgames.com") {
            throw new Error("Not mappable");
        }

        return url;
    }
}