
import { InfoSourceType } from "@game-watch/shared";
import axios from "axios";
import * as cheerio from 'cheerio';

import { InfoSearcher, InfoSearcherContext, SearchResponse } from "../search-service";
import { matchingName } from "../util/matching-name";

export class MetacriticSearcher implements InfoSearcher {
    public type = InfoSourceType.Metacritic;

    public async search(search: string, { logger }: InfoSearcherContext): Promise<SearchResponse | null> {
        const { data } = await axios.get<string>(
            `https://www.metacritic.com/search/game/${search}/results`
        );

        const $ = cheerio.load(data);

        const resultRow = $(".first_result a");
        if (!resultRow.length) {
            logger.debug("No results found");

            return null;
        }

        const gameLink = resultRow.attr("href");
        if (!gameLink) {
            return null;
        }

        const fullName = resultRow.text().trim();
        if (!matchingName(fullName, search)) {
            logger.debug(`Found name '${fullName}' does not include search '${search}'. Skipping`);

            return null;
        }

        const criticScore = $(".main_stats > .metascore_w").text().trim();
        if (isNaN(parseInt(criticScore))) {
            logger.debug(`Found score '${fullName}' is not a number. Skipping`);

            return null;
        }

        return {
            remoteGameId: `https://www.metacritic.com${gameLink}`,
            remoteGameName: fullName,
        };

    }
}
