import axios from "axios";
import * as cheerio from 'cheerio';

import { InfoSourceType, MetacriticData } from "../../info-source/info-source-model";
import { InfoResolver } from "../resolve-service";

export class MetacriticResolver implements InfoResolver {
    public type = InfoSourceType.Metacritic;

    public async resolve(id: string): Promise<MetacriticData> {
        console.time("Resolve Metacritic");
        const { data } = await axios.get<string>(id);
        console.timeEnd("Resolve Metacritic");

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
}