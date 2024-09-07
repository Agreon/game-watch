import { InfoSourceType, OpenCriticData, OpenCriticRating } from '@game-watch/shared';
import { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';

import { InfoResolver, InfoResolverContext } from '../resolve-service';

export class OpenCriticResolver implements InfoResolver {
    public type = InfoSourceType.OpenCritic;

    public constructor(private readonly axios: AxiosInstance) { }

    public async resolve({ source }: InfoResolverContext): Promise<OpenCriticData> {
        const { data } = await this.axios.get<string>(source.data.id);

        const $ = cheerio.load(data);

        const fullName = $('h1').first().text().trim();
        const rating = $('app-tier-display > img').first().attr('alt')!.toLowerCase() as OpenCriticRating;
        const score = $('.score-orb > .inner-orb').first().text().trim();
        const recommendedBy = $('.score-orb > .inner-orb').last().text().trim();

        return {
            ...source.data,
            fullName,
            rating,
            criticScore: parseInt(score),
            recommendedBy: parseInt(recommendedBy),
        };
    }
}
