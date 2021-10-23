import { EpicGameData, InfoSourceType } from "../../info-source/info-source-model";
import { getEpicSearchResponse } from "../../search/searchers/epic-searcher";
import { InfoResolver } from "../resolve-service";

export class EpicResolver implements InfoResolver {
    public type = InfoSourceType.Epic;

    public async resolve(id: string): Promise<EpicGameData> {
        console.time("Resolve Epic");
        const gameData = await getEpicSearchResponse(id);
        console.timeEnd("Resolve Epic");

        return {
            id: id,
            fullName: gameData.title,
            url: `https://www.epicgames.com/store/de-DE/p/${gameData.productSlug.split("/")[0]}`,
            thumbnailUrl: gameData.keyImages.find(({ type }) => type === "OfferImageWide")?.url ?? "",
            releaseDate: gameData.releaseDate ?? "TBD",
            priceInformation: gameData.price.totalPrice.originalPrice !== 0 ? {
                initial: `${gameData.price.totalPrice.originalPrice / 100}`,
                final: `${gameData.price.totalPrice.discountPrice / 100}`,
            } : undefined
        };

    }
}