import { BaseGameData, InfoSourceType } from '@game-watch/shared';
import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';

import { InfoSearcher, InfoSearcherContext } from '../search-service';
import { matchingName } from '../util/matching-name';

export class ProtonSearcher implements InfoSearcher {
    public type = InfoSourceType.Proton;

    public constructor(private readonly axios: AxiosInstance) { }

    public async search(
        search: string,
        { logger }: InfoSearcherContext,
    ): Promise<BaseGameData | null> {
        // We have to search in the steam store because the algolia endpoint has rate limiting.
        const { data } = await this.axios.get<string>(
            'https://store.steampowered.com/search',
            { params: { term: search, ignore_preferences: 1 } }
        );

        const $ = cheerio.load(data);

        const resultRow = $('.search_result_row');
        if (!resultRow.length) {
            logger.debug('No search results found');

            return null;
        }

        const gameId = resultRow.attr('data-ds-appid');
        if (!gameId) {
            return null;
        }

        const fullName = ($('.search_result_row .title')[0].children[0] as any).data as string;
        if (!matchingName(fullName, search)) {
            logger.debug(`Found name '${fullName}' does not include search '${search}'. Skipping`);

            return null;
        }

        try {
            const { data: { tier } } = await this.axios.get(
                `https://www.protondb.com/api/v1/reports/summaries/${gameId}.json`
            );

            if (tier === 'pending') {
                logger.debug(`Found '${fullName}' does not have a rating yet. Skipping`);

                return null;
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                logger.debug(`${search} was not found at proton. It does not have a rating yet`);

                return null;
            }
            throw error;
        }

        logger.debug(`Found gameId '${gameId}'`);

        return {
            id: gameId,
            fullName,
            url: `https://www.protondb.com/app/${gameId}`,
        };
    }
}
