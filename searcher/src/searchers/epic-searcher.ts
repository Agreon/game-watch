import { BaseGameData, Country, InfoSourceType } from "@game-watch/shared";
import { AxiosInstance } from "axios";
import * as cheerio from 'cheerio';

import { InfoSearcher, InfoSearcherContext } from "../search-service";
import { matchingName } from "../util/matching-name";

export class EpicSearcher implements InfoSearcher {
    public type = InfoSourceType.Epic;

    public constructor(private readonly axios: AxiosInstance) { }

    private mapCountryCode(country: Country) {
        switch (country) {
            case "DE":
                // Don't ask me why this is inconsistent.
                return "de";
            case "US":
                return "en-US";
        }
    }

    public async search(search: string, { logger, userCountry }: InfoSearcherContext): Promise<BaseGameData | null> {
        const { data } = await this.axios.get<string>(
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

        const url = `https://www.epicgames.com${gameLink}`;
        return {
            id: url,
            url,
            fullName,
        };
    }
}
