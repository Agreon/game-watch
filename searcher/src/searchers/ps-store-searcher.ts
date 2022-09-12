import { mapCountryCodeToAcceptLanguage, mapCountryCodeToLanguage } from "@game-watch/service";
import { InfoSourceType } from "@game-watch/shared";
import { AxiosInstance } from "axios";

import { InfoSearcher, InfoSearcherContext } from "../search-service";
import { matchingName } from "../util/matching-name";

interface SearchResponse {
    data: {
        universalSearch: {
            results: Array<{
                id: string
                name: string
                storeDisplayClassification: string
            }>
        }
    }

}

export class PsStoreSearcher implements InfoSearcher {
    public type = InfoSourceType.PsStore;

    public constructor(private readonly axios: AxiosInstance) {}

    public async search(search: string, { logger, userCountry }: InfoSearcherContext) {
        const { data: { data: { universalSearch: { results } } } } = await this.axios.get<SearchResponse>(
            `https://web.np.playstation.com/api/graphql/v1/op`,
            {
                headers: {
                    "X-PSN-Store-Locale-Override": mapCountryCodeToAcceptLanguage(userCountry)
                },
                params: {
                    variables: {
                        countryCode: userCountry,
                        languageCode: mapCountryCodeToLanguage(userCountry),
                        pageOffset: 0,
                        pageSize: 25,
                        searchTerm: search,
                    },
                    extensions: {
                        persistedQuery: {
                            version: 1,
                            sha256Hash: "d77d9a513595db8d75fc26019f01066d54c8d0de035a77a559bd687fa1010418",
                        }
                    }
                }
            }
        );

        // The ps store likes to order DLCs and cosmetics prior to the game.
        const result = results.find(result => result.storeDisplayClassification === "FULL_GAME");
        if (!result) {
            return null;
        }

        const gameId = result.id;
        const fullName = result.name;

        if (!matchingName(fullName, search)) {
            logger.debug(`Found name '${fullName}' does not include search '${search}'. Skipping`);

            return null;
        }

        logger.debug(`Found gameId '${gameId}'`);

        return {
            remoteGameId: `https://store.playstation.com/${mapCountryCodeToAcceptLanguage(userCountry)}/product/${gameId}`,
            remoteGameName: fullName,
        };
    }
}
