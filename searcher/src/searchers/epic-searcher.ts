import { Country, InfoSourceType } from "@game-watch/shared";
import axios from "axios";
import * as cheerio from 'cheerio';

import { InfoSearcher, InfoSearcherContext, SearchResponse } from "../search-service";
import { matchingName } from "../util/matching-name";

export class EpicSearcher implements InfoSearcher {
    public type = InfoSourceType.Epic;

    private mapCountryCode(country: Country) {
        switch (country) {
            case "DE":
                // Don't ask me why this is inconsistent.
                return "de";
            case "US":
                return "en-US";
        }
    }

    public async search(search: string, { logger, userCountry }: InfoSearcherContext): Promise<SearchResponse | null> {
        const { data } = await axios.get<string>(
            `https://www.epicgames.com/store/${this.mapCountryCode(userCountry)}/browse`,
            {
                params: {
                    q: search,
                    sortBy: "relevancy",
                    sortDir: "DESC",
                    count: 1
                }
            }
        );

        const $ = cheerio.load(data);

        const gameLink = $("div[data-component=DiscoverCardLayout] > a").first().attr("href")?.trim();
        if (!gameLink) {
            logger.debug("No results found");

            return null;
        }

        const fullName = $("div[data-component=DirectionAuto]").first().text().trim();
        if (!matchingName(fullName, search)) {
            logger.debug(`Found name '${fullName}' does not include search '${search}'. Skipping`);

            return null;
        }

        return {
            remoteGameId: `https://www.epicgames.com${gameLink}`,
            remoteGameName: fullName
        };
    }
}
