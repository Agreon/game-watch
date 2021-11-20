import { InfoSourceType } from "@game-watch/shared";
import axios from "axios";

import { InfoSearcher, InfoSearcherContext } from "../search-service";
import { matchingName } from "../util/matching-name";

export interface EpicSearchResponse {
    title: string;
    releaseDate: string | null;
    productSlug: string;
    keyImages: Array<{
        type: string;
        url: string;
    }>;
    price: {
        totalPrice: {
            discountPrice: number;
            originalPrice: number;
        }
    }
}

// TODO: Seems to be flaky
export const getEpicSearchResponse = async (search: string): Promise<EpicSearchResponse> => {
    const { data } = await axios.get(
        `https://www.epicgames.com/graphql?operationName=searchStoreQuery&variables={"category":"games/edition/base|software/edition/base|editors|bundles/games","count":1,"country":"DE","keywords":"${encodeURIComponent(search)}","locale":"de-DE","sortBy":"relevancy","sortDir":"DESC","withPrice":true}&extensions={"persistedQuery":{"version":1,"sha256Hash":"f45c217481a66dd17324fbb288509bac7a2d81762e72518cb9d448a0aec43350"}}`
    );

    console.log(data);

    return data.data.Catalog.searchStore.elements[0];
};

export class EpicSearcher implements InfoSearcher {
    public type = InfoSourceType.Epic;

    public async search(search: string, { logger }: InfoSearcherContext): Promise<string | null> {
        logger.debug(encodeURIComponent(search));
        const gameData = await getEpicSearchResponse(search);
        if (!gameData) {
            return null;
        }

        if (!matchingName(gameData.title, search)) {
            logger.debug(`Found name '${gameData.title}' does not include search '${search}'. Skipping`);

            return null;
        }

        return `https://www.epicgames.com/store/de-DE/p/${gameData.productSlug.split("/")[0]}`;
    }
}
