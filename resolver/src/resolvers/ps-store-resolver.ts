import {
    Country,
    InfoSourceType,
    PsStoreGameData,
    StorePriceInformation,
} from '@game-watch/shared';
import { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';

import { InfoResolver, InfoResolverContext } from '../resolve-service';
import { parseCurrencyValue } from '../util/parse-currency-value';
import { parseDate } from '../util/parse-date';

export class PsStoreResolver implements InfoResolver {
    public type = InfoSourceType.PsStore;

    public constructor(private readonly axios: AxiosInstance) { }

    public async resolve({ userCountry, source }: InfoResolverContext): Promise<PsStoreGameData> {

        const { data } = await this.axios.get<string>(source.data.url);

        const $ = cheerio.load(data);

        const fullName = $('.game-title').text().trim();

        const price = $('.psw-t-title-m[data-qa="mfeCtaMain#offer0#finalPrice"]').text().trim();
        const originalPrice = $(
            '.psw-t-title-s[data-qa="mfeCtaMain#offer0#originalPrice"]'
        ).text().trim();
        const releaseDate = $(
            'dd[data-qa="gameInfo#releaseInformation#releaseDate-value"]'
        ).text().trim();

        let thumbnailUrl = $('img[data-qa="gameBackgroundImage#heroImage#preview"]')?.attr('src');
        if (!thumbnailUrl) {
            thumbnailUrl = $('source[media="(min-width: 1024px)"]').attr('srcset');
        }

        return {
            ...source.data,
            fullName,
            thumbnailUrl,
            releaseDate: userCountry === 'DE'
                ? parseDate(releaseDate, ['D.M.YYYY'])
                : parseDate(releaseDate, ['M/D/YYYY']),
            // TODO: reduced
            priceInformation: this.getPriceInformation({ price, originalPrice }, userCountry),
        };
    }

    private getPriceInformation(
        { price, originalPrice }: Record<string, any>,
        userCountry: Country
    ): StorePriceInformation | undefined {
        if (
            (userCountry === 'DE' && price === 'Kostenlos')
            || (userCountry === 'US' && price === 'Free')
        ) {
            return {
                final: 0
            };
        }

        const initial = parseCurrencyValue(originalPrice || price);
        const final = parseCurrencyValue(price);

        if (!initial || !final) {
            return undefined;
        }

        return {
            initial,
            final,
        };
    }
}
