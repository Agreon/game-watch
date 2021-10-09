import * as cheerio from 'cheerio';
import axios from "axios";
import { InfoSearcher } from '../search-service';
import { InfoSourceType } from '../../info-source/info-source-model';
import { Logger } from '@nestjs/common';
import { matchingName } from '../../util/matching-name';

export class SteamSearcher implements InfoSearcher {
    public type = InfoSourceType.Steam;
    private logger = new Logger(SteamSearcher.name);

    public async search(search: string) {
        console.time("Visit Steam");
        const { data } = await axios.get<string>(
            `https://store.steampowered.com/search/?term=${encodeURIComponent(search)}`
        );
        console.timeEnd("Visit Steam");

        const $ = cheerio.load(data);

        const resultRow = $(".search_result_row");
        if (!resultRow) {
            this.logger.debug("No results found");

            return null;
        }

        const gameId = resultRow.attr("data-ds-appid");
        // TODO: Sometimes children are not found
        const fullName = ($(".search_result_row .title")[0].children[0] as any).data as string;

        if (!matchingName(fullName, search)) {
            this.logger.debug(`Found name '${fullName}' does not include search '${search}'. Skipping steam`);

            return null;
        }

        this.logger.debug(`Found appId to game '${gameId}'`);

        return gameId ?? null;
    }
}