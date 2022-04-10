import { InfoSourceType } from "@game-watch/shared";
import axios from "axios";

import { InfoSearcher, InfoSearcherContext } from "../search-service";
import { matchingName } from "../util/matching-name";

export class PsStoreSearcher implements InfoSearcher {
    public type = InfoSourceType.PsStore;

    public async search(search: string, { logger }: InfoSearcherContext) {
        const response = await axios.get(
            `https://web.np.playstation.com/api/graphql/v1/op`,
            {
                headers: {
                    "X-PSN-Store-Locale-Override": "de-DE"
                },
                params: {
                    variables: {
                        countryCode: "DE",
                        languageCode: "de",
                        pageOffset: 0,
                        pageSize: 1,
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

        const results = response.data.data.universalSearch.results;
        if (!results.length) {
            return null;
        }

        const gameId = results[0].id;
        const fullName = results[0].name;

        if (!matchingName(fullName, search)) {
            logger.debug(`Found name '${fullName}' does not include search '${search}'. Skipping`);

            return null;
        }

        logger.debug(`Found gameId '${gameId}'`);

        return {
            remoteGameId: `https://store.playstation.com/de-de/product/${gameId}`,
            remoteGameName: fullName,
        };
    }
}
