/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { InfoSourceType, StorePriceInformation, SwitchGameData } from '@game-watch/shared';
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

    public async resolve({ userCountry, source }: InfoResolverContext): Promise<SwitchGameData> {
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
        const { data } = await this.axios.get<string>(source.data.id);
        const $ = cheerio.load(data);

        const thumbnailUrl = $("meta[property='og:image']").first().attr('content');

        const fullName = extract(data, /(?<=gameTitle": ").+\b/);
        if (!fullName) {
            throw new Error('Could not find name of game');
        }

        const releaseDate = extract(data, /(?<=Erscheinungsdatum: )[\d.]+/);

        return {
            ...source.data,
            fullName,
            thumbnailUrl,
            releaseDate: parseDate(releaseDate, ['DD.MM.YYYY']),
            originalReleaseDate: releaseDate,
            priceInformation: await this.getPriceInformation(data),
        };
    }

    private async getPriceInformation(
        pageContents: string
    ): Promise<StorePriceInformation | undefined> {
        const priceId = extract(pageContents, /(?<=offdeviceNsuID": ").\d+/);
        if (!priceId) {
            return undefined;
        }

        const { data } = await this.axios.get<any>(
            `https://api.ec.nintendo.com/v1/price?country=DE&lang=de&ids=${priceId}`
        );
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
