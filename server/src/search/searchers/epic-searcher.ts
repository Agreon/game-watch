import { Logger } from "@nestjs/common";
import axios from "axios";
import { InfoSourceType } from "game-watch-shared";

import { matchingName } from "../../util/matching-name";
import { InfoSearcher } from "../search-service";

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

export const getEpicSearchResponse = async (search: string): Promise<EpicSearchResponse> => {
    const { data } = await axios.get<any>(
        `https://www.epicgames.com/graphql?operationName=searchStoreQuery&variables={"category":"games/edition/base|software/edition/base|editors|bundles/games","count":1,"country":"DE","keywords":"${encodeURIComponent(search)}","locale":"de-DE","sortBy":"relevancy","sortDir":"DESC","withPrice":true}&extensions={"persistedQuery":{"version":1,"sha256Hash":"f45c217481a66dd17324fbb288509bac7a2d81762e72518cb9d448a0aec43350"}}`
    );

    return data.data.Catalog.searchStore.elements[0];
};

export class EpicSearcher implements InfoSearcher {
    public type = InfoSourceType.Epic;
    private logger = new Logger(EpicSearcher.name);

    public async search(search: string): Promise<string | null> {
        const gameData = await getEpicSearchResponse(search);
        if (!gameData) {
            return null;
        }

        if (!matchingName(gameData.title, search)) {
            this.logger.debug(`Found name '${gameData.title}' does not include search '${search}'. Skipping epic`);

            return null;
        }

        return `https://www.epicgames.com/store/de-DE/p/${gameData.productSlug.split("/")[0]}`;
    }
}
