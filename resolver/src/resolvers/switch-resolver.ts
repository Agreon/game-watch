/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Country, InfoSourceType, StorePriceInformation, SwitchGameData } from '@game-watch/shared';
import { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';

import { InfoResolver, InfoResolverContext } from '../resolve-service';
import { parseCurrencyValue } from '../util/parse-currency-value';
import { parseDate } from '../util/parse-date';

const extract = (content: string, regex: RegExp) => {
    const result = new RegExp(regex).exec(content);

    return result ? result[0] : undefined;
};

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
        const { userCountry, source } = context;

        if (userCountry === 'NZ' || userCountry === 'AU') {
            return await this.resolveAUandNZ(context);
        }

        if (userCountry === 'US') {
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
                            'persistedQuery': {
                                'version': 1,
                                'sha256Hash': 'bfa2734b3ac921de5a7297bbd70fdd10492a1b072cb4b6bc6b9cc91d3a366fbc'
                            }
                        }
                    }
                }
            );

            const product = (data.products as SwitchUsGraphqlResponse[]).find(
                ({ productType }) => productType === 'SIMPLE'
            );

            if (product) {
                return {
                    id: source.data.id,
                    url: source.data.url,
                    fullName: product.name,
                    thumbnailUrl: `https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/b_white/f_auto/q_auto/dpr_1.2/c_scale,w_400/${product.productImage.publicId}`,
                    releaseDate: parseDate(product.releaseDate),
                    originalReleaseDate: product.releaseDate,
                    priceInformation: this.getPriceInformationForUsStore(product.prices),
                };
            }
        }

        const { data } = await this.axios.get<string>(source.data.url);
        const $ = cheerio.load(data);

        const thumbnailUrl = $("meta[property='og:image']").first().attr('content');

        const fullName = extract(data, /(?<=gameTitle": ").+\b/);
        if (!fullName) {
            throw new Error('Could not find name of game');
        }

        const priceId = extract(data, /(?<=offdeviceNsuID": ").\d+/)!;
        const price = await this.getPriceInformation(priceId, userCountry);

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

    private async resolveAUandNZ({ userCountry, source }: InfoResolverContext) {
        const [{ data }, price] = await Promise.all([
            this.axios.get<string>(source.data.url),
            this.getPriceInformation(source.data.id, userCountry)
        ]);

        const $ = cheerio.load(data);

        const fullName = $("meta[name='search.name']").attr('content');
        if (!fullName) {
            throw new Error('Could not find name of game');
        }

        const thumbnailUrl = $("meta[name='search.thumbnail']").attr('content');

        const releaseDate = extract(data, /(?<=release_date_on_eshop":")([\d.]+-[\d.]+-[\d.]+)/);

        return {
            ...source.data,
            fullName,
            thumbnailUrl,
            releaseDate: parseDate(releaseDate, ['YYYY-MM-DD']),
            originalReleaseDate: releaseDate,
            priceInformation: this.parsePriceInformation(price)
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
}
