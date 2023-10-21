import {
    EpicApproximateReleasePlan,
    EpicPriceInformation,
    retrieveEpicGameData,
} from '@game-watch/browser';
import {
    InfoSourceType,
    StoreGameData,
    StorePriceInformation,
    StoreReleaseDateInformation,
} from '@game-watch/shared';
import dayjs from 'dayjs';

import { InfoResolver, InfoResolverContext } from '../resolve-service';

export class EpicResolver implements InfoResolver {
    public type = InfoSourceType.Epic;

    public async resolve({ source }: InfoResolverContext): Promise<StoreGameData> {
        const [offerId, sandboxId] = source.data.id.split(',');
        const {
            releaseDate,
            price,
            keyImages,
            approximateReleasePlan,
            title,
            tags
        } = await retrieveEpicGameData(offerId, sandboxId, source.country.split('-')[0]);

        return {
            ...source.data,
            fullName: title,
            thumbnailUrl: this.getThumbnailUrl(keyImages),
            isEarlyAccess: tags.find(({ id }) => id === '1310') !== undefined,
            // Price information is not reliable at this point in time. Epic always has a price set.
            priceInformation: approximateReleasePlan && approximateReleasePlan.releaseDateType !== 'BY_DATE'
                ? undefined
                : this.getPriceInformation(price),
            releaseDate: this.getReleaseDateInformation({ releaseDate, approximateReleasePlan }),
        };
    }

    private getThumbnailUrl(keyImages: Array<{ type: string; url: string }>) {
        const offerImage = keyImages.find(({ type }) => type === 'OfferImageWide');
        if (!offerImage) {
            throw new Error('Could not find OfferImageWide keyImage');
        }
        const thumbnailUrl = new URL(offerImage.url);
        thumbnailUrl.searchParams.delete('h');
        thumbnailUrl.searchParams.append('h', '215');

        return thumbnailUrl.toString();
    }

    private getReleaseDateInformation(
        { releaseDate, approximateReleasePlan }: {
            releaseDate: string | null;
            approximateReleasePlan: EpicApproximateReleasePlan | null;
        },
    ): StoreReleaseDateInformation | undefined {
        if (approximateReleasePlan && approximateReleasePlan.releaseDateType !== 'BY_DATE') {
            if (approximateReleasePlan.releaseDateType === 'UNKNOWN') {
                return undefined;
            }

            return {
                isExact: false,
                date: this.transformApproximateReleasePlanToDate(approximateReleasePlan)
            };
        }

        if (!releaseDate) {
            return undefined;
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
            date: parsedDate.set('hour', 0).toDate()
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
            case 'UNKNOWN':
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
