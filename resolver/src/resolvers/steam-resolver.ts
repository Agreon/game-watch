import {
    Country,
    InfoSourceType,
    mapCountryCodeToAcceptLanguage,
    parseStructure,
    SteamGameData,
    StorePriceInformation,
} from '@game-watch/shared';
import { AxiosInstance } from 'axios';
import * as t from 'io-ts';

import { InfoResolver, InfoResolverContext } from '../resolve-service';
import { parseDate } from '../util/parse-date';

const SteamApiResponseStructure = t.record(
    t.string,
    t.type({
        data: t.intersection([
            t.type({
                header_image: t.string,
                release_date: t.type({
                    date: t.string
                }),
                is_free: t.boolean,
                genres: t.array(t.type({
                    id: t.string,
                })),
            }),
            t.partial({
                price_overview: t.partial({
                    initial: t.number,
                    final: t.number
                }),
            })
        ]),
        success: t.boolean
    })
);

export type SteamApiResponse = t.TypeOf<typeof SteamApiResponseStructure>;

/**
 * TODO:
 * - Add offer end date => We need to make a second api call
 */
export class SteamResolver implements InfoResolver {
    public type = InfoSourceType.Steam;

    public constructor(private readonly axios: AxiosInstance) { }

    public async resolve({ source }: InfoResolverContext): Promise<SteamGameData> {
        const { data: unknownData } = await this.axios.get<SteamApiResponse>(
            `https://store.steampowered.com/api/appdetails`,
            {
                params: {
                    appids: source.data.id,
                    // Determines the returned currency.
                    cc: source.country.split('-')[0],
                },
                // Determines the returned language.
                headers: { 'Accept-Language': mapCountryCodeToAcceptLanguage(source.country) }
            }
        );

        const gameData = parseStructure(SteamApiResponseStructure, unknownData);

        const { success, data } = gameData[source.data.id];
        if (!success) {
            throw new Error('Steam API request was unsuccessful');
        }

        return {
            id: source.data.id,
            fullName: source.data.fullName,
            url: `https://store.steampowered.com/app/${source.data.id}`,
            thumbnailUrl: data.header_image,
            releaseDate: this.parseReleaseDate(data.release_date.date, source.country),
            originalReleaseDate: data.release_date.date,
            priceInformation: data.is_free
                ? { final: 0 }
                : this.getPriceInformation(data.price_overview ?? {}),
            isEarlyAccess: data.genres.some(genre => genre.id === '70')
        };
    }

    private parseReleaseDate(releaseDate: string, userCountry: Country) {
        // Transforms `CH-DE` to `de`
        const locale = (userCountry.split('-')[1] ?? userCountry.split('-')[0]).toLowerCase();

        const cleanedReleaseDate = releaseDate
            // The dots create problems with dayjs parsing.
            .replace(/\.|\,/g, '')
            // Portuguese release dates will come in the format: 1\/set.\/2011
            .replace(/\\\//g, ' ')
            // For some reason "Okt" and "Dez" is leading to an invalid date.
            // So we use the english one.
            .replace('Okt', 'Oct')
            .replace('Dez', 'Dec');

        // Sometimes the locale does not match the return value. Then we try other formats.
        return parseDate(cleanedReleaseDate, ['D MMM YYYY', 'D MMMM YYYY'], locale)
            ?? parseDate(cleanedReleaseDate, ['D MMM YYYY', 'D MMMM YYYY'])
            ?? parseDate(cleanedReleaseDate);
    }

    private getPriceInformation(
        { initial, final }: Record<string, any>
    ): StorePriceInformation | undefined {
        if (!initial || !final) {
            return undefined;
        }

        // Those values are returned in cents. So we need to convert them.
        return {
            initial: initial / 100,
            final: final / 100,
        };
    }
}
