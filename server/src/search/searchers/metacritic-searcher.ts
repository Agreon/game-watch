
import { Logger } from "@nestjs/common";
import axios from "axios";
import * as cheerio from 'cheerio';

import { InfoSourceType } from "../../info-source/info-source-model";
import { matchingName } from "../../util/matching-name";
import { InfoSearcher } from "../search-service";

export class MetacriticSearcher implements InfoSearcher {
    public type = InfoSourceType.Metacritic;
    private logger = new Logger(MetacriticSearcher.name);

    public async search(search: string): Promise<string | null> {
        const { data } = await axios.get<string>(
            `https://www.metacritic.com/search/game/${search}/results`
        );

        const $ = cheerio.load(data);

        const resultRow = $(".first_result a");
        if (!resultRow.length) {
            this.logger.debug("No results found");

            return null;
        }

        const gameLink = resultRow.attr("href");
        if (!gameLink) {
            return null;
        }

        const fullName = resultRow.text().trim();
        if (!matchingName(fullName, search)) {
            this.logger.debug(`Found name '${fullName}' does not include search '${search}'. Skipping metacritic`);

            return null;
        }

        const criticScore = $(".metascore_w > span").text().trim();
        if (isNaN(parseInt(criticScore))) {
            this.logger.debug(`Found score '${fullName}' is not a number. Skipping metacritic`);

            return null;
        }

        return `https://www.metacritic.com${gameLink}`;
    }
}
