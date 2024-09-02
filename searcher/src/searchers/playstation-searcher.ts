import { Country, InfoSourceType, mapCountryCodeToAcceptLanguage } from '@game-watch/shared';
import { AxiosInstance } from 'axios';

import { InfoSearcher, InfoSearcherContext } from '../search-service';
import { matchingName } from '../util/matching-name';

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

export const mapCountryCodeToLanguageCode = (country: Country): string => {
    switch (country) {
        case 'DE':
        case 'CH-DE':
        case 'AT':
            return 'de';
        case 'FR':
        case 'CH-FR':
        case 'BE-FR':
            return 'fr';
        case 'BE-NL':
        case 'NL':
            return 'nl';
        case 'IT':
        case 'CH-IT':
            return 'it';
        case 'ES':
            return 'es';
        case 'PT':
            return 'pt';
        case 'RU':
            return 'ru';
        case 'US':
        case 'AU':
        case 'NZ':
        case 'GB':
        case 'IE':
        case 'ZA':
            return 'en';
    }
};

export class PlaystationSearcher implements InfoSearcher {
    public type = InfoSourceType.Playstation;

    public constructor(private readonly axios: AxiosInstance) { }

    public async search(search: string, { logger, userCountry }: InfoSearcherContext) {
        const {
            data: { data: { universalSearch: { results } } }
        } = await this.axios.get<SearchResponse>(
            `https://web.np.playstation.com/api/graphql/v1/op`,
            {
                headers: {
                    'Origin': 'https://store.playstation.com',
                    'Content-Type': 'application/json',
                    'X-PSN-Store-Locale-Override': mapCountryCodeToAcceptLanguage(userCountry)
                },
                params: {
                    variables: {
                        countryCode: userCountry.split('-')[0],
                        languageCode: mapCountryCodeToLanguageCode(userCountry),
                        pageOffset: 0,
                        pageSize: 15,
                        searchTerm: search,
                    },
                    extensions: {
                        persistedQuery: {
                            version: 1,
                            sha256Hash:
                                'd77d9a513595db8d75fc26019f01066d54c8d0de035a77a559bd687fa1010418',
                        }
                    }
                }
            }
        );

        // The ps store likes to order DLCs and cosmetics prior to the game.
        const hits = results.filter(result => ['FULL_GAME', 'GAME_BUNDLE'].includes(result.storeDisplayClassification));
        if (!hits.length) {
            logger.debug('No search results found');
            return null;
        }
        const { id: gameId, name: fullName } = hits[0];

        if (!matchingName(fullName, search)) {
            logger.debug(`Found name '${fullName}' does not include search '${search}'. Skipping`);

            return null;
        }

        logger.debug(`Found gameId '${gameId}'`);

        const acceptLanguage = mapCountryCodeToAcceptLanguage(userCountry).toLowerCase();
        const url = `https://store.playstation.com/${acceptLanguage}/product/${gameId}`;

        return {
            id: url,
            url,
            fullName,
        };
    }
}
