import { InfoSourceType, MetacriticData } from "@game-watch/shared";
import { AxiosInstance } from "axios";
import * as cheerio from 'cheerio';

import { InfoResolver, InfoResolverContext } from "../resolve-service";

export class MetacriticResolver implements InfoResolver {
    public type = InfoSourceType.Metacritic;

    public constructor(private readonly axios: AxiosInstance) { }

    public async resolve({ source }: InfoResolverContext): Promise<MetacriticData> {
        const { data } = await this.axios.get<string>(source.data.id);

        const $ = cheerio.load(data);

        const fullName = $(".product_title h1").text().trim();
        const criticScore = $(".metascore_w > span").text().trim();
        const userScore = $(".metascore_w.user").first().text().trim() || "TBA";

        return {
            ...source.data,
            fullName,
            criticScore,
            userScore
        };
    }
}
