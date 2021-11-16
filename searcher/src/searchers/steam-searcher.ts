import { InfoSourceType } from "@game-watch/shared";
import axios from "axios";
import * as cheerio from 'cheerio';

import { InfoSearcher } from '../search-service';
import { matchingName } from "../util/matching-name";

export class SteamSearcher implements InfoSearcher {
    public type = InfoSourceType.Steam;
    // TODO: Use cool logger
    private logger = console;

    public async search(search: string) {
        const { data } = await axios.get<string>(
            `https://store.steampowered.com/search/?term=${encodeURIComponent(search)}`
        );

        const $ = cheerio.load(data);

        const resultRow = $(".search_result_row");
        if (!resultRow.length) {
            this.logger.debug("No results found");

            return null;
        }

        const gameId = resultRow.attr("data-ds-appid");
        const fullName = ($(".search_result_row .title")[0].children[0] as any).data as string;

        if (!matchingName(fullName, search)) {
            this.logger.debug(`Found name '${fullName}' does not include search '${search}'. Skipping steam`);

            return null;
        }

        this.logger.debug(`Found appId to game '${gameId}'`);

        return gameId ?? null;
    }
}