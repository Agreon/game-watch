import { mapCountryCodeToAcceptLanguage, mapCountryCodeToLanguage } from "@game-watch/service";
import { InfoSourceType, SteamGameData, StorePriceInformation } from "@game-watch/shared";
import { AxiosInstance } from "axios";

import {  InfoResolver, InfoResolverContext } from "../resolve-service";
import { parseDate } from "../util/parse-date";

/**
 * TODO:
 * - Add offer end date => We need to make a second api call
 */
export class SteamResolver implements InfoResolver {
    public type = InfoSourceType.Steam;

    public constructor(private readonly axios: AxiosInstance) {}

    public async resolve(id: string, { userCountry }: InfoResolverContext): Promise<SteamGameData> {
        const { data } = await this.axios.get<any>(
            `https://store.steampowered.com/api/appdetails`,
            {
                params: {
                    appids: id,
                    cc: mapCountryCodeToLanguage(userCountry),
                },
                headers: { 'Accept-Language': mapCountryCodeToAcceptLanguage(userCountry) }
            }
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

        // The dots make problems with dayjs parsing.
        const releaseDate = json.release_date.date.replace(/\.|\,/g, "");

        return {
            id,
            fullName: json.name,
            url: `https://store.steampowered.com/app/${id}`,
            thumbnailUrl: json.header_image,
            // Sometimes english, sometimes german..
            releaseDate: parseDate(releaseDate, ["D MMM YYYY", "D MMMM YYYY"], "de") ?? parseDate(releaseDate, ["D MMM YYYY", "D MMMM YYYY"]) ?? parseDate(releaseDate),
            originalReleaseDate: releaseDate,
            priceInformation: json.is_free ? { final: 0 } : this.getPriceInformation(json.price_overview ?? {}),
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
