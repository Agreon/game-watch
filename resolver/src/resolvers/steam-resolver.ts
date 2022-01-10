import { InfoSourceType, SteamGameData, StorePriceInformation } from "@game-watch/shared";
import axios from "axios";

import { InfoResolver } from "../resolve-service";

/**
 * TODO:
 * - Add offer end date => We need to make a second api call
 * - Unit is not always euro
 */
export class SteamResolver implements InfoResolver {
    public type = InfoSourceType.Steam;

    public async resolve(id: string): Promise<SteamGameData> {
        const { data } = await axios.get<any>(
            `https://store.steampowered.com/api/appdetails?appids=${id}&cc=de`,
            { headers: { 'Accept-Language': 'de' } }
        );

        const gameData = data[id];

        const { success } = gameData;
        if (!success) {
            throw new Error("Steam API request unsuccessful");
        }

        const json = gameData.data as Record<string, any>;

        if (!json.price_overview && !json.is_free) {
            // TODO: We need to open the site to get the price.
        }

        return {
            id,
            fullName: json.name,
            url: `https://store.steampowered.com/app/${id}`,
            thumbnailUrl: json.header_image,
            releaseDate: json.release_date.date === "Coming Soon" ? "TBD" : json.release_date.date,
            priceInformation: json.price_overview ? this.getPriceInformation(json.price_overview) : undefined,
            controllerSupport: json.controller_support,
            categories: json.categories ? Object.values(json.categories).map(({ description }) => description) : undefined,
            genres: json.genres ? Object.values(json.genres).map(({ description }) => description) : undefined,
        };
    }

    private getPriceInformation({ initial, final }: Record<string, any>): StorePriceInformation | undefined {
        if (!initial || !final) {
            return undefined;
        }

        return {
            initial: initial / 100,
            final: final / 100,
        };
    }
}
