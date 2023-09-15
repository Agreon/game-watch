import { InfoSourceType, MetacriticData } from '@game-watch/shared';
import { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';

import { InfoResolver, InfoResolverContext } from '../resolve-service';

export class MetacriticResolver implements InfoResolver {
    public type = InfoSourceType.Metacritic;

    public constructor(private readonly axios: AxiosInstance) { }

    public async resolve({ source }: InfoResolverContext): Promise<MetacriticData> {
        const { data } = await this.axios.get<string>(source.data.id);

        const $ = cheerio.load(data);

        const fullName = $('.c-productHero_title').text().trim();
        const criticScore = $('.c-siteReviewScore_medium > span').first().text().trim();
        const userScore = $('.c-siteReviewScore_user > span').first().text().trim() || 'tbd';

        return {
            ...source.data,
            fullName,
            criticScore,
            userScore
        };
    }
}
