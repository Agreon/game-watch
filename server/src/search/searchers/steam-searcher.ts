import * as cheerio from 'cheerio';
import axios from "axios";
import { InfoSearcher } from '../search-service';
import { InfoSourceType } from '../../game/info-source-model';
import { Logger } from '@nestjs/common';

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

        const appId = resultRow.attr("data-ds-appid");
        const appName = ($(".search_result_row .title")[0].children[0] as any).data as string;

        const searchTokens = search.toLowerCase().split(" ");
        const nameTokens = appName.replace(/:/g, "").toLowerCase().split(" ");
        if (!nameTokens.some(token => searchTokens.includes(token))) {
            this.logger.debug(`Found name '${appName}' does not include search '${search}'. Skipping steam`);

            return null;
        }

        this.logger.debug(`Found appId to game '${appId}'`);

        return appId ?? null;
    }
}