import { withBrowser } from '@game-watch/browser';
import {
    Country,
    InfoSourceType,
    mapCountryCodeToAcceptLanguage,
    PsStoreGameData,
    StorePriceInformation,
} from '@game-watch/shared';
import { AxiosInstance } from 'axios';

import { InfoResolver, InfoResolverContext } from '../resolve-service';
import { parseCurrencyValue } from '../util/parse-currency-value';
import { parseDate } from '../util/parse-date';

export class PsStoreResolver implements InfoResolver {
    public type = InfoSourceType.PsStore;

    public constructor(private readonly axios: AxiosInstance) { }

    public async resolve({ source, logger }: InfoResolverContext): Promise<PsStoreGameData> {

        return await withBrowser(mapCountryCodeToAcceptLanguage(source.country), async browser => {
            await browser.goto(source.data.id);
            await browser.waitForSelector('.psw-t-title-m');

            const fullName = await browser.$eval(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                'h1[data-qa="mfe-game-title#name"]', (el) => el.textContent!.trim()
            );

            const price = await browser.evaluate(
                () => document
                    .querySelector('.psw-t-title-m[data-qa="mfeCtaMain#offer0#finalPrice"]')
                    ?.textContent
                    ?.trim()
            );
            const originalPrice = await browser.evaluate(
                () => document.querySelector(
                    '.psw-t-title-s[data-qa="mfeCtaMain#offer0#originalPrice"]'
                )?.textContent?.trim()
            );

            const releaseDate = await browser.evaluate(
                () => document.querySelector(
                    'dd[data-qa="gameInfo#releaseInformation#releaseDate-value"]'
                )?.textContent?.trim()
            );

            let thumbnailUrl = await browser.evaluate(
                () => document.querySelector(
                    'img[data-qa="gameBackgroundImage#heroImage#image"]'
                )?.getAttribute('src')
            );
            if (!thumbnailUrl) {
                logger.warn('Could not resolve hero image URL. Trying tile image...');
                thumbnailUrl = await browser.evaluate(
                    () => document.querySelector(
                        'img[data-qa="gameBackgroundImage#tileImage#image"]'
                    )?.getAttribute('src')
                );

                if (!thumbnailUrl) {
                    throw new Error('Could not retrieve thumbnail URL');
                }
            }

            return {
                ...source.data,
                fullName,
                thumbnailUrl,
                priceInformation:
                    this.getPriceInformation({ price, originalPrice }, source.country),
                releaseDate: ['DE', 'AT', 'CH-DE'].includes(source.country)
                    ? parseDate(releaseDate, ['D.M.YYYY'])
                    : parseDate(releaseDate, ['M/DD/YYYY'])
                    ?? parseDate(releaseDate, ['DD/MM/YYYY'])
                    ?? parseDate(releaseDate, ['D/M/YYYY'])
                    ?? parseDate(releaseDate),
                originalReleaseDate: releaseDate
            };
        });
    }

    private getPriceInformation(
        { price, originalPrice }: Record<string, any>,
        userCountry: Country
    ): StorePriceInformation | undefined {
        if (
            (userCountry === 'DE' && price === 'Kostenlos')
            || (userCountry !== 'DE' && price === 'Free')
        ) {
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
