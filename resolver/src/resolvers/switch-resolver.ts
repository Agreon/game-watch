/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { extract } from '@game-watch/service';
import { Country, InfoSourceType, StorePriceInformation, SwitchGameData } from '@game-watch/shared';
import { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';

import { InfoResolver, InfoResolverContext } from '../resolve-service';
import { parseCurrencyValue } from '../util/parse-currency-value';
import { parseDate } from '../util/parse-date';

interface SwitchUSGraphqlPriceResponse {
    minimum: {
        finalPrice: number;
    },
    maximum: {
        finalPrice: number;
    } | null
}

interface SwitchUsGraphqlResponse {
    name: string;
    productType: string;
    prices: SwitchUSGraphqlPriceResponse;
    productImage: {
        publicId: string;
    }
    releaseDate: string;
}

export class SwitchResolver implements InfoResolver {
    public type = InfoSourceType.Switch;

    public constructor(private readonly axios: AxiosInstance) { }

    public async resolve(context: InfoResolverContext): Promise<SwitchGameData> {
        const { source, logger } = context;

        if (source.country === 'NZ' || source.country === 'AU') {
            return await this.resolveAUandNZ(context);
        }

        if (source.country === 'US') {
            return await this.resolveUSA(context);
        }

        const { data } = await this.axios.get<string>(source.data.url);
        const $ = cheerio.load(data);

        const thumbnailUrl = $("meta[property='og:image']").first().attr('content')!;

        const fullName = $('title').first().text().split('|')[0].trim();

        const priceId = extract(data, /(?<=offdeviceNsuID": ").\d+/)!;
        if (!priceId) {
            logger.warn(`Could not get game id. Game might not have a price yet`);

            const releaseDate = extract(data, /(?<=Erscheinungsdatum: )(.*[\d.]+)/);

            return {
                ...source.data,
                fullName,
                thumbnailUrl,
                releaseDate: parseDate(releaseDate, ['DD.MM.YYYY']),
                originalReleaseDate: releaseDate
            };
        }

        const price = await this.getPriceInformation(priceId, source.country);
        const releaseDate = extract(data, new RegExp(`(?<="${priceId}": \\[").{10}`));

        return {
            ...source.data,
            fullName,
            thumbnailUrl,
            releaseDate: parseDate(releaseDate, ['DD/MM/YYYY']),
            originalReleaseDate: releaseDate,
            priceInformation: this.parsePriceInformation(price),
        };
    }

    private async resolveUSA({ source }: InfoResolverContext) {
        const urlParts = source.data.id.split('/');
        const slug = urlParts[urlParts.length - 2];

        const { data: { data } } = await this.axios.get(
            'https://graph.nintendo.com',
            {
                params: {
                    operationName: 'ProductDetail',
                    variables: {
                        slug,
                        locale: 'en_US'
                    },
                    extensions: {
                        persistedQuery: {
                            version: 1,
                            sha256Hash:
                                '045da5dd0a3d883247d9e9d435547624dec15786fe2470f5d4c51b380859e809'
                        }
                    }
                }
            }
        );

        const product = (data.products as SwitchUsGraphqlResponse[]).find(
            ({ productType }) => productType === 'SIMPLE'
        );

        if (!product) {
            throw new Error("Could not find 'SIMPLE' product in the response");
        }

        return {
            id: source.data.id,
            url: source.data.url,
            fullName: product.name,
            thumbnailUrl: 'https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad'
                + `/b_white/f_auto/q_auto/dpr_1.2/c_scale,w_400/${product.productImage.publicId}`,
            releaseDate: parseDate(product.releaseDate),
            originalReleaseDate: product.releaseDate,
            priceInformation: this.getPriceInformationForUsStore(product.prices),
        };
    }

    private getPriceInformationForUsStore(
        { minimum, maximum }: SwitchUSGraphqlPriceResponse
    ): StorePriceInformation | undefined {
        if (minimum === null) {
            return undefined;
        }

        const initial = maximum?.finalPrice || minimum.finalPrice;
        const final = minimum.finalPrice;

        return {
            initial,
            final,
        };
    }

    private async resolveAUandNZ({ source }: InfoResolverContext) {
        const { data } = await this.axios.get<string>(source.data.url);

        const $ = cheerio.load(data);

        const fullName = $("meta[property='og:title']").attr('content')!.split('/')[0];
        if (!fullName) {
            throw new Error('Could not find name of game');
        }

        const thumbnailUrl = $("meta[property='og:image']").attr('content')!;

        const releaseDate = $("div[itemprop='releaseDate']").text();

        let priceInformation;
        const eshopUrl = $('a.nal-button-primary').attr('href');
        if (eshopUrl) {
            const urlParts = eshopUrl.split('/');
            const eshopId = urlParts[urlParts.length - 2];

            priceInformation = this.parsePriceInformation(
                await this.getPriceInformation(eshopId, source.country)
            );
        }

        return {
            ...source.data,
            fullName,
            thumbnailUrl,
            releaseDate: parseDate(releaseDate, ['DD/MM/YYYY']),
            originalReleaseDate: releaseDate,
            priceInformation
        };
    }

    private async getPriceInformation(
        id: string,
        userCountry: Country
    ): Promise<StorePriceInformation | undefined> {
        const { data } = await this.axios.get<any>(
            `https://api.ec.nintendo.com/v1/price`,
            {
                params: {
                    country: userCountry,
                    lang: 'en',
                    ids: id
                }
            }
        );

        return data;
    }

    private parsePriceInformation(data: any): StorePriceInformation | undefined {
        if (!data) {
            return undefined;
        }

        const { regular_price, discount_price } = data.prices[0];

        const initial = parseCurrencyValue(regular_price.raw_value);
        const final = parseCurrencyValue((discount_price || regular_price).raw_value);

        if (initial === undefined || final === undefined) {
            return undefined;
        }

        return {
            initial,
            final,
        };
    }

}
