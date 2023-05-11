import {
    EpicApproximateReleasePlan,
    EpicPriceInformation,
    retrieveEpicGameData,
} from '@game-watch/browser';
import {
    EpicGameData,
    InfoSourceType,
    StorePriceInformation,
    StoreReleaseDateInformation,
} from '@game-watch/shared';
import dayjs from 'dayjs';

import { InfoResolver, InfoResolverContext } from '../resolve-service';

export class EpicResolver implements InfoResolver {
    public type = InfoSourceType.Epic;

    public async resolve({ source }: InfoResolverContext): Promise<EpicGameData> {
        const [offerId, sandboxId] = source.data.id.split(',');
        const {
            releaseDate,
            price,
            keyImages,
            approximateReleasePlan,
        } = await retrieveEpicGameData(offerId, sandboxId, source.country.split('-')[0]);

        const thumbnailUrl = keyImages.find(({ type }) => type === 'OfferImageWide');
        if (!thumbnailUrl) {
            throw new Error('Could not find OfferImageWide keyImage');
        }

        // TODO: EarlyAccess
        return {
            ...source.data,
            thumbnailUrl: thumbnailUrl.url,
            // Price information is not reliable at this point in time. Epic always has a price set.
            priceInformation: approximateReleasePlan && approximateReleasePlan.releaseDateType !== 'BY_DATE'
                ? undefined
                : this.getPriceInformation(price),
            releaseDate: this.getReleaseDateInformation({ releaseDate, approximateReleasePlan }),
        };
    }

    private getReleaseDateInformation(
        { releaseDate, approximateReleasePlan }: {
            releaseDate: string;
            approximateReleasePlan: EpicApproximateReleasePlan | null;
        },
    ): StoreReleaseDateInformation | undefined {
        if (approximateReleasePlan && approximateReleasePlan.releaseDateType !== 'BY_DATE') {
            return {
                isExact: false,
                date: this.transformApproximateReleasePlanToDate(approximateReleasePlan)
            };
        }

        const parsedDate = dayjs(releaseDate);
        if (!parsedDate.isValid()) {
            return undefined;
        }
        if (parsedDate.year() === 2099) {
            return undefined;
        }

        return {
            isExact: true,
            date: parsedDate.toDate()
        };
    }

    private transformApproximateReleasePlanToDate(approximateReleasePlan: EpicApproximateReleasePlan) {
        switch (approximateReleasePlan.releaseDateType) {
            case 'BY_YEAR':
                return `${approximateReleasePlan.year}`;
            case 'BY_MONTH':
                // Those months are not zero indexed
                const month = dayjs().month(approximateReleasePlan.month - 1).format('MMM');
                return `${month} ${approximateReleasePlan.year}`;
            case 'BY_QUARTER':
                return `${approximateReleasePlan.quarter.toUpperCase()} ${approximateReleasePlan.year}`;
            case 'BY_DATE':
                throw new Error('Unexpected match. Should extract date from releaseDate');
        }
    }

    private getPriceInformation(
        { totalPrice: { discountPrice, originalPrice } }: EpicPriceInformation
    ): StorePriceInformation | undefined {
        return {
            initial: originalPrice / 100,
            final: discountPrice / 100
        };
    }
}
