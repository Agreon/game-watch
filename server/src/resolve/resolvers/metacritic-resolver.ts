import axios from "axios";
import * as cheerio from 'cheerio';

import { InfoSourceType, MetacriticData } from "../../info-source/info-source-model";
import { InfoResolver } from "../resolve-service";

export class MetacriticResolver implements InfoResolver {
    public type = InfoSourceType.Metacritic;

    public async resolve(id: string): Promise<MetacriticData> {
        const { data } = await axios.get<string>(id);

        const $ = cheerio.load(data);

        const fullName = $(".product_title h1").text().trim();
        const criticScore = $(".metascore_w > span").text().trim() || "TBD";
        const userScore = $(".metascore_w.user").first().text().trim() || "TBD";

        return {
            id,
            url: id,
            fullName,
            criticScore,
            userScore
        };
    }
    public async mapUrlToId(url: string): Promise<string> {
        const { hostname } = new URL(url);
        if (hostname !== "www.metacritic.com") {
            throw new Error("Not mappable");
        }

        return url;
    }
}