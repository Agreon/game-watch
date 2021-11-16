import { InfoSourceType, SteamGameData } from "@game-watch/shared";
import axios from "axios";

import { InfoResolver } from "../resolve-service";


/**
 * TODO:
 * - Add offer end date => We need to make a second api call
 */
export class SteamResolver implements InfoResolver {
    public type = InfoSourceType.Steam;

    // TODO: Use cool logger
    private logger = console;

    public async resolve(id: string): Promise<SteamGameData> {
        const { data } = await axios.get<any>(
            `https://store.steampowered.com/api/appdetails?appids=${id}`
        );

        const gameData = data[id];

        const { success } = gameData;
        if (!success) {
            throw new Error("Steam API request unsuccessful");
        }

        const json = gameData.data as Record<string, any>;

        try {
            if (!json.price_overview && !json.is_free) {
                // TODO: We need to open the site to get the price.
            }

            return {
                id,
                fullName: json.name,
                url: `https://store.steampowered.com/app/${id}`,
                thumbnailUrl: json.header_image,
                releaseDate: json.release_date.date === "Coming Soon" ? "TBD" : json.release_date.date,
                priceInformation: json.price_overview ? {
                    initial: json.price_overview.initial_formatted,
                    final: json.price_overview.final_formatted,
                    discountPercentage: json.price_overview.discount_percent,
                } : undefined,
                controllerSupport: json.controller_support,
                categories: json.categories ? Object.values(json.categories).map(({ description }) => description) : undefined,
                genres: json.genres ? Object.values(json.genres).map(({ description }) => description) : undefined,
            };
        } catch (error) {
            this.logger.error("Steam api response was malformed", { data });
            throw error;
        }
    }

    public async mapUrlToId(url: string): Promise<string> {
        const { hostname } = new URL(url);
        if (hostname !== "store.steampowered.com") {
            throw new Error("Not mappable");
        }

        const parts = url.split("/");
        const gameId = parts[parts.length - 3];
        if (!gameId.length) {
            throw new Error("Could not extract gameId");
        }

        return gameId;
    }

}