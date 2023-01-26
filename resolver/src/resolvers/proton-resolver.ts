import { InfoSourceType, mapCountryCodeToAcceptLanguage, ProtonGameData } from '@game-watch/shared';
import { AxiosInstance } from 'axios';

import { InfoResolver, InfoResolverContext } from '../resolve-service';

export class ProtonResolver implements InfoResolver {
    public type = InfoSourceType.Proton;

    public constructor(private readonly axios: AxiosInstance) { }

    public async resolve({ source }: InfoResolverContext): Promise<ProtonGameData> {
        // The steam API will give us the details if linux is natively supported.
        const { data } = await this.axios.get<any>(
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

        const gameData = data[source.data.id];

        const { success } = gameData;
        if (!success) {
            throw new Error('Steam API request unsuccessful');
        }

        const json = gameData.data as Record<string, any>;
        if (json.platforms.linux) {
            return {
                ...source.data,
                thumbnailUrl: json.header_image,
                score: 'native'
            };
        }

        const { data: { tier } } = await this.axios.get(
            `https://www.protondb.com/api/v1/reports/summaries/${source.data.id}.json`
        );

        return {
            ...source.data,
            thumbnailUrl: json.header_image,
            score: tier
        };
    }
}
