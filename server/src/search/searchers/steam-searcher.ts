import { Logger } from '@nestjs/common';
import axios from "axios";
import * as cheerio from 'cheerio';

import { InfoSourceType } from '../../info-source/info-source-model';
import { matchingName } from '../../util/matching-name';
import { InfoSearcher } from '../search-service';

export class SteamSearcher implements InfoSearcher {
    public type = InfoSourceType.Steam;
    private logger = new Logger(SteamSearcher.name);

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