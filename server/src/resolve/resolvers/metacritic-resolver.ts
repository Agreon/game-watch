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

        // TODO: No available scores
        // https://www.metacritic.com/game/playstation-5/disciples-liberation
        // => Maybe already exclude in search

        const fullName = $(".product_title > h1").text().trim();
        const criticScore = $(".metascore_w > span").text().trim();
        const userScore = $(".metascore_w.user").first().text().trim();

        return {
            id,
            url: id,
            fullName,
            criticScore,
            userScore
        };
    }
}