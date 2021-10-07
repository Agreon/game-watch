import { InfoSourceType, PsStoreGameData } from "../../game/info-source-model";
import { InfoResolver } from "../resolve-service";
import axios from "axios";
import * as cheerio from 'cheerio';

export class PsStoreResolver implements InfoResolver {
    public type = InfoSourceType.PsStore;

    public async resolve(storePage: string): Promise<PsStoreGameData> {
        console.time("Resolve PsStore");

        /**
         * We could get something from the _next content of the page
         * - name
         * - images
         * script id="__NEXT_DATA__"
         */
        const { data } = await axios.get(storePage);

        // console.log(data);
        const $ = cheerio.load(data);
        const nextScript = $("#__NEXT_DATA__").eq(0);
        console.log(
            "SCRIPT",
            nextScript.data(),
            nextScript.text()
        );

        console.timeEnd("Resolve PsStore");

        return {
            id: storePage,
            reduced: false
        };
    }
}