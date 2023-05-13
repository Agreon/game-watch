import { InfoSource } from '@game-watch/database';
import {
    InfoSourceState,
    InfoSourceType,
    mapCountryCodeToAcceptLanguage,
    parseStructure,
} from '@game-watch/shared';
import { AxiosInstance } from 'axios';
import * as t from 'io-ts';

const SteamApiResponseDataStructure = t.intersection([
    t.type({
        header_image: t.string,
        name: t.string,
        release_date: t.type({
            date: t.string
        }),
        is_free: t.boolean,
        genres: t.array(t.type({
            id: t.string,
        })),
        platforms: t.type({
            linux: t.boolean
        })
    }),
    t.partial({
        price_overview: t.partial({
            initial: t.number,
            final: t.number
        }),
    })
]);

const SteamApiResponseStructure = t.record(
    t.string,
    t.type({
        data: SteamApiResponseDataStructure,
        success: t.boolean
    })
);

export type SteamApiResponse = t.TypeOf<typeof SteamApiResponseDataStructure>;

export const getSteamApiData = async (
    { axios, source }: {
        axios: AxiosInstance,
        source: InfoSource<InfoSourceType, InfoSourceState.Found>
    }
): Promise<SteamApiResponse> => {
    const { data: unknownData } = await axios.get(
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

    return data;
};
