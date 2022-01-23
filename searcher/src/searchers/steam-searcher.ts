import { InfoSourceType } from "@game-watch/shared";
import axios from "axios";
import * as cheerio from 'cheerio';

import { InfoSearcher, InfoSearcherContext } from '../search-service';
import { matchingName } from "../util/matching-name";

export class SteamSearcher implements InfoSearcher {
    public type = InfoSourceType.Steam;

    public async search(search: string, { logger }: InfoSearcherContext) {
        const { data } = await axios.get<string>(
            `https://store.steampowered.com/search/?term=${encodeURIComponent(search)}`
        );

        const $ = cheerio.load(data);

        const resultRow = $(".search_result_row");
        if (!resultRow.length) {
            logger.debug("No search results found");

            return null;
        }

        const gameId = resultRow.attr("data-ds-appid");
        if (!gameId) {
            return null;
        }

        const fullName = ($(".search_result_row .title")[0].children[0] as any).data as string;

        if (!matchingName(fullName, search)) {
            logger.debug(`Found name '${fullName}' does not include search '${search}'. Skipping`);

            return null;
        }


        return {
            remoteGameId: gameId,
            remoteGameName: fullName
        };
    }
}
