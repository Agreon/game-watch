import * as cheerio from 'cheerio';
import axios from "axios";
import { InfoSearcher } from '../search-service';
import { InfoSourceType } from '../../game/info-source-model';
import { Logger } from '@nestjs/common';

export class SteamSearcher implements InfoSearcher {
    public type = InfoSourceType.Steam;
    private logger = new Logger(SteamSearcher.name);

    public async search(search: string) {
        this.logger.debug(`Searching steam for '${search}'`);

        console.time("Visit Steam");
        const { data } = await axios.get<string>(
            `https://store.steampowered.com/search/?term=${encodeURIComponent(search)}`
        );
        console.timeEnd("Visit Steam");

        if (data.includes("0 results match your search.")) {
            this.logger.debug("No results found");

            return null;
        }

        const $ = cheerio.load(data);
        const appId = $(".search_result_row").attr("data-ds-appid");
        const appName = ($(".search_result_row .title")[0].children[0] as any).data as string;

        const searchTokens = search.toLowerCase().split(" ");
        const nameTokens = appName.toLowerCase().split(" ");
        if (!nameTokens.some(token => searchTokens.includes(token))) {
            this.logger.debug("Found name does not include search. Skipping steam");

            return null;
        }

        this.logger.debug(`Found appId to game '${appId}'`);

        return appId ?? null;
    }
}