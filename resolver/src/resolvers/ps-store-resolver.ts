import { withBrowser } from "@game-watch/browser";
import { InfoSourceType, PsStoreGameData, StorePriceInformation } from "@game-watch/shared";

import { InfoResolver } from "../resolve-service";
import { parseCurrencyValue } from "../util/parse-currency-value";
import { parseDate } from "../util/parse-date";

/**
 * TODO:
 * We could get something from the _next content of the page
 * - name
 * - images
 * script id="__NEXT_DATA__"
*/
export class PsStoreResolver implements InfoResolver {
    public type = InfoSourceType.PsStore;

    public async resolve(storePage: string): Promise<PsStoreGameData> {
        return await withBrowser(async browser => {
            await browser.goto(storePage);
            await browser.waitForSelector(".psw-t-title-m");

            // const { data } = await axios.get<string>(
            //     storePage
            // );

            // console.time("LOAD");
            // const $ = cheerio.load(data);

            // const script = (($("#__NEXT_DATA__")[0] as any).children[0] as any).data as string;

            // // const script = $("#__NEXT_DATA__").children()[0].data;
            // const content = JSON.parse(script);
            // console.timeEnd("LOAD");

            // console.log(content.props.pageProps.batarangs["game-title"]);

            // pdp-cta
            // basePrices, discountPrice, name

            // pdp-upsells
            // name,
            // GAMEHUB_COVER_ART

            // ä next-data
            // game-title => releaseDate, name
            // cta => price
            // thumbnail => background-image

            const fullName = await browser.$eval('h1[data-qa="mfe-game-title#name"]', (el) => el.textContent!.trim());

            const price = await browser.evaluate(
                () => document.querySelector('.psw-t-title-m[data-qa="mfeCtaMain#offer0#finalPrice"]')?.textContent?.trim()
            );
            const originalPrice = await browser.evaluate(
                () => document.querySelector('.psw-t-title-s[data-qa="mfeCtaMain#offer0#originalPrice"]')?.textContent?.trim()
            );
            // const discountDescription = await browser.evaluate(
            //     () => document.querySelector('span[data-qa="mfeCtaMain#offer0#discountDescriptor"]')?.textContent?.trim()
            // );

            const releaseDate = await browser.evaluate(
                () => document.querySelector('dd[data-qa="gameInfo#releaseInformation#releaseDate-value"]')?.textContent?.trim()
            );

            const thumbnailUrl = await browser.evaluate(
                () => document.querySelector('img[data-qa="gameBackgroundImage#heroImage#image"]')?.getAttribute("src")
            );

            return {
                id: storePage,
                url: storePage,
                fullName,
                thumbnailUrl: thumbnailUrl ?? undefined,
                priceInformation: this.getPriceInformation({ price, originalPrice }),
                releaseDate: parseDate(releaseDate, ["D.M.YYYY"]),
            };
        });
    }

    private getPriceInformation({ price, originalPrice }: Record<string, any>): StorePriceInformation | undefined {
        if (price === "Kostenlos") {
            return {
                final: 0
            };
        }


        const initial = parseCurrencyValue(originalPrice || price);
        const final = parseCurrencyValue(price);

        if (!initial || !final) {
            return undefined;
        }

        return {
            initial,
            final,
        };
    }
}
