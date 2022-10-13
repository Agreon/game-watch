import { mapCountryCodeToAcceptLanguage, mapCountryCodeToLanguage } from '@game-watch/service';
import { Country, InfoSourceType, SteamGameData, StorePriceInformation } from '@game-watch/shared';
import { AxiosInstance } from 'axios';

import { InfoResolver, InfoResolverContext } from '../resolve-service';
import { parseDate } from '../util/parse-date';

/**
 * TODO:
 * - Add offer end date => We need to make a second api call
 */
export class SteamResolver implements InfoResolver {
    public type = InfoSourceType.Steam;

    public constructor(private readonly axios: AxiosInstance) { }

    public async resolve({ source }: InfoResolverContext): Promise<SteamGameData> {
        const { data } = await this.axios.get<any>(
            `https://store.steampowered.com/api/appdetails`,
            {
                params: {
                    appids: source.data.id,
                    // Determines the returned currency.
                    cc: mapCountryCodeToLanguage(source.country),
                },
                // Determines the returned language.
                headers: { 'Accept-Language': mapCountryCodeToAcceptLanguage(source.country) }
            }
        );

        const gameData = data[source.data.id];

        const { success } = gameData;
        if (!success) {
            throw new Error('Steam API request unsuccessful');
        }

        const json = gameData.data as Record<string, any>;

        if (!json.price_overview && !json.is_free) {
            // TODO: We need to open the site to get the price.
        }

        return {
            id: source.data.id,
            fullName: source.data.fullName,
            url: `https://store.steampowered.com/app/${source.data.id}`,
            thumbnailUrl: json.header_image,
            releaseDate: this.parseReleaseDate(json.release_date.date, source.country),
            originalReleaseDate: json.release_date.date,
            priceInformation: json.is_free
                ? { final: 0 }
                : this.getPriceInformation(json.price_overview ?? {}),
            controllerSupport: json.controller_support,
            categories: json.categories
                ? Object.values(json.categories).map(({ description }) => description)
                : undefined,
            genres: json.genres
                ? Object.values(json.genres).map(({ description }) => description)
                : undefined,
        };
    }

    private parseReleaseDate(releaseDate: string, userCountry: Country) {
        const locale = mapCountryCodeToLanguage(userCountry);

        const parsedReleaseDate = releaseDate
            // The dots create problems with dayjs parsing.
            .replace(/\.|\,/g, '')
            // For some reason "Okt" is leading to an invalid date. So we use the english one.
            .replace('Okt', 'Oct');

        // Sometimes english, sometimes german..
        // TODO: What's with other countries?
        return parseDate(parsedReleaseDate, ['D MMM YYYY', 'D MMMM YYYY'], locale)
            ?? parseDate(parsedReleaseDate, ['D MMM YYYY', 'D MMMM YYYY'])
            ?? parseDate(parsedReleaseDate);
    }

    private getPriceInformation(
        { initial, final }: Record<string, any>
    ): StorePriceInformation | undefined {
        if (!initial || !final) {
            return undefined;
        }

        return {
            initial: initial / 100,
            final: final / 100,
        };
    }
}
