import { InfoSource } from '@game-watch/database';
import {
    DeckVerified,
    InfoSourceState,
    InfoSourceType,
    parseStructure,
    ProtonDbScore,
    ProtonGameData,
} from '@game-watch/shared';
import { AxiosInstance } from 'axios';
import * as t from 'io-ts';

import { InfoResolver, InfoResolverContext } from '../resolve-service';
import { getSteamApiData } from '../util/get-steam-api-data';

export const ProtonApiInfoResponseStructure = t.type({
    tier: t.union([
        t.literal('native'),
        t.literal('platinum'),
        t.literal('gold'),
        t.literal('silver'),
        t.literal('bronze'),
        t.literal('borked'),
    ])
});

export const ProtonApiDeckInfoResponseStructure = t.type({
    success: t.number,
    results: t.type({
        resolved_category: t.number
    })
});

export class ProtonResolver implements InfoResolver {
    public type = InfoSourceType.Proton;

    public constructor(private readonly axios: AxiosInstance) { }

    public async resolve({ source }: InfoResolverContext): Promise<ProtonGameData> {
        // The steam API will give us the details whether linux is natively supported.
        const data = await getSteamApiData({ axios: this.axios, source });

        if (data.platforms.linux) {
            const deckVerified = await this.getProtonDbDeckVerifiedStatus(source);

            return {
                ...source.data,
                score: 'native',
                deckVerified,
                thumbnailUrl: data.header_image,
            };
        }

        const [
            score,
            deckVerified
        ] = await Promise.all([
            this.getProtonScore(source),
            this.getProtonDbDeckVerifiedStatus(source)
        ]);

        return {
            ...source.data,
            score,
            deckVerified,
            thumbnailUrl: data.header_image,
        };
    }

    private async getProtonScore(
        source: InfoSource<InfoSourceType, InfoSourceState.Found>
    ): Promise<ProtonDbScore> {
        const { data: unknownData } = await this.axios.get(
            `https://www.protondb.com/api/v1/reports/summaries/${source.data.id}.json`
        );

        const { tier } = parseStructure(ProtonApiInfoResponseStructure, unknownData);

        return tier;
    }

    private async getProtonDbDeckVerifiedStatus(
        source: InfoSource<InfoSourceType, InfoSourceState.Found>
    ): Promise<DeckVerified> {
        const { data: unknownData } = await this.axios.get(
            `https://www.protondb.com/proxy/steam/deck-verified?nAppID=${source.data.id}`
        );

        const {
            success,
            results,
        } = parseStructure(ProtonApiDeckInfoResponseStructure, unknownData);

        if (success !== 1) {
            throw new Error('Proton API request was unsuccessful');
        }

        switch (results.resolved_category) {
            case 2:
                return 'playable';
            case 3:
                return 'verified';
            default:
                return 'unsupported';
        }
    }
}
