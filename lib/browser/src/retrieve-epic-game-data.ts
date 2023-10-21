import { parseStructure } from '@game-watch/shared';
import * as t from 'io-ts';

import { withBrowser } from './with-browser';

const PriceStructure = t.type({
    totalPrice:
        t.type({
            originalPrice: t.number,
            discountPrice: t.number,
            currencyInfo: t.type({
                decimals: t.number
            })
        }),
});

export type EpicPriceInformation = t.TypeOf<typeof PriceStructure>;

const ApproximateReleasePlanStructure = t.union([
    t.type({
        year: t.number,
        releaseDateType: t.literal('BY_YEAR')
    }),
    t.type({
        year: t.number,
        month: t.number,
        releaseDateType: t.literal('BY_MONTH')
    }),
    t.type({
        year: t.number,
        quarter: t.string,
        releaseDateType: t.literal('BY_QUARTER')
    }),
    t.type({
        releaseDateType: t.literal('BY_DATE')
    }),
    t.type({
        releaseDateType: t.literal('UNKNOWN'),
    })
]);
export type EpicApproximateReleasePlan = t.TypeOf<typeof ApproximateReleasePlanStructure>;

const EpicGameDataStructure = t.type({
    title: t.string,
    releaseDate: t.union([t.string, t.null]),
    keyImages: t.array(t.type({ type: t.string, url: t.string })),
    price: PriceStructure,
    approximateReleasePlan: t.union([ApproximateReleasePlanStructure, t.null]),
    urlSlug: t.string,
    productSlug: t.union([t.string, t.null]),
    offerMappings: t.array(t.type({ pageSlug: t.string })),
    tags: t.array(t.type({ id: t.string, name: t.string }))
});

export type EpicGameDataResponse = t.TypeOf<typeof EpicGameDataStructure>;

export class EmptyResponseError extends Error { }

// We need to use a browser for Epic store api requests because cloudflare would block axios requests.
export const retrieveEpicGameData = async (
    offerId: string,
    sandboxId: string,
    countryCode: string,
): Promise<EpicGameDataResponse> => {
    return await withBrowser('en-US', async browser => {
        const searchParams = new URLSearchParams({
            operationName: 'getCatalogOffer',
            variables: JSON.stringify({
                locale: 'en-US',
                country: countryCode,
                offerId,
                sandboxId,
            }),
            extensions: JSON.stringify({
                persistedQuery: {
                    version: 1,
                    sha256Hash: '6797fe39bfac0e6ea1c5fce0ecbff58684157595fee77e446b4254ec45ee2dcb',
                }
            })
        });

        await browser.goto(`https://store.epicgames.com/graphql?${searchParams.toString()}`);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const unknownData = await browser.$eval('body', (el) => JSON.parse(el.textContent!));
        const catalogData = unknownData?.data?.Catalog?.catalogOffer;
        if (!catalogData) {
            throw new EmptyResponseError(`No catalogData found for ${offerId}`);
        }

        return parseStructure(EpicGameDataStructure, catalogData);
    });
};
