import { extract } from '@game-watch/service';
import { InfoSourceType, StoreGameData, StorePriceInformation, StoreReleaseDateInformation } from '@game-watch/shared';
import { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';

import { InfoResolver, InfoResolverContext } from '../resolve-service';

export class XboxResolver implements InfoResolver {
    public type = InfoSourceType.Xbox;

    public constructor(private readonly axios: AxiosInstance) { }

    public async resolve({ source }: InfoResolverContext): Promise<StoreGameData> {
        const { data } = await this.axios.get<string>(source.data.url);

        const $ = cheerio.load(data);
        const fullName = $('.ProductDetailsHeaderProductTitle').text();
        if (!fullName) {
            throw new Error('Could not extract name');
        }

        return {
            ...source.data,
            fullName,
            thumbnailUrl: this.getThumbnailUrl(data),
            priceInformation: this.getPriceInformation(data),
            releaseDate: this.getReleaseDateInformation(data)
        };

    }

    private getThumbnailUrl(data: string): string {
        const url = extract(data, /(?<="boxArt":{"url":")[^"]+/)?.replaceAll('\\u002F', '/');
        if (!url) {
            throw new Error('Could not extract thumbnailUrl');
        }

        const thumbnailUrl = new URL(url);
        thumbnailUrl.searchParams.append('w', '460');

        return thumbnailUrl.toString();
    }

    private getPriceInformation(data: string): StorePriceInformation | undefined {
        const initial = parseFloat(extract(data, /(?<=msrp":)(\d|\.)+/) ?? '');
        const final = parseFloat(extract(data, /(?<=listPrice":)(\d|\.)+/) ?? '');

        if (isNaN(initial) || isNaN(final)) {
            throw new Error('Could not extract price information');
        }

        return {
            initial,
            final
        };
    }

    private getReleaseDateInformation(data: string): StoreReleaseDateInformation | undefined {
        const releaseDate = extract(data, /(?<=releaseDate":")(\d|\.|-|:|T|Z)+/);
        if (!releaseDate) {
            return undefined;
        }

        const date = new Date(releaseDate);

        return {
            isExact: true,
            date,
        };
    }
}
