import { InfoSourceType, PsStoreGameData } from "../../info-source/info-source-model";
import { InfoResolver } from "../resolve-service";
import { withBrowser } from "../../util/with-browser";

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
        console.time("Resolve PsStore");

        return await withBrowser(async browser => {
            await browser.goto(storePage);
            console.timeEnd("Resolve PsStore");

            await browser.waitForSelector(".psw-t-title-m");

            const fullName = await browser.$eval('h1[data-qa="mfe-game-title#name"]', (el) => el.textContent!.trim());

            const price = await browser.evaluate(
                () => document.querySelector('.psw-t-title-m[data-qa="mfeCtaMain#offer0#finalPrice"]')?.textContent?.trim()
            );
            const originalPrice = await browser.evaluate(
                () => document.querySelector('.psw-t-title-s[data-qa="mfeCtaMain#offer0#originalPrice"]')?.textContent?.trim()
            );
            const discountDescription = await browser.evaluate(
                () => document.querySelector('span[data-qa="mfeCtaMain#offer0#discountDescriptor"]')?.textContent?.trim()
            );

            const releaseDate = await browser.evaluate(
                () => document.querySelector('dd[data-qa="gameInfo#releaseInformation#releaseDate-value"]')?.textContent?.trim()
            );

            const thumbnailUrl = await browser.evaluate(
                () => document.querySelector('img[data-qa="gameBackgroundImage#heroImage#image"]')?.getAttribute("src")
            );

            return {
                id: storePage,
                storeUrl: storePage,
                fullName,
                thumbnailUrl: thumbnailUrl ?? "",
                priceInformation: price ? {
                    initial: originalPrice || price,
                    final: price,
                    discountDescription: discountDescription || ""
                } : undefined,
                releaseDate,
            };
        });

    }
}