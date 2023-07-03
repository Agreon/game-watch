import { Page, withBrowser } from '@game-watch/browser';
import { Logger } from '@game-watch/service';
import {
    Country,
    InfoSourceType,
    mapCountryCodeToAcceptLanguage,
    StoreGameData,
    StorePriceInformation,
    StoreReleaseDateInformation,
} from '@game-watch/shared';

import { InfoResolver, InfoResolverContext } from '../resolve-service';
import { parseCurrencyValue } from '../util/parse-currency-value';
import { parseDate } from '../util/parse-date';

export class PlaystationResolver implements InfoResolver {
    public type = InfoSourceType.Playstation;

    public async resolve({ source, logger }: InfoResolverContext): Promise<StoreGameData> {

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

            return {
                ...source.data,
                fullName,
                thumbnailUrl: await this.getThumbnailUrl(browser, logger),
                priceInformation:
                    this.getPriceInformation({ price, originalPrice }, source.country),
                releaseDate: this.getReleaseDateInformation(source.country, releaseDate),
                originalReleaseDate: releaseDate
            };
        });
    }

    private async getThumbnailUrl(
        browser: Page,
        logger: Logger,
    ) {
        let imageUrl = await browser.evaluate(
            () => document.querySelector(
                'img[data-qa="gameBackgroundImage#heroImage#image"]'
            )?.getAttribute('src')
        );
        if (!imageUrl) {
            logger.warn('Could not resolve hero image URL. Trying tile image...');
            imageUrl = await browser.evaluate(
                () => document.querySelector(
                    'img[data-qa="gameBackgroundImage#tileImage#image"]'
                )?.getAttribute('src')
            );

            if (!imageUrl) {
                throw new Error('Could not retrieve thumbnail URL');
            }
        }

        const thumbnailUrl = new URL(imageUrl);
        thumbnailUrl.searchParams.delete('w');
        thumbnailUrl.searchParams.append('w', '460');

        return thumbnailUrl.toString();

    }

    private getReleaseDateInformation(
        userCountry: Country,
        date?: string,
    ): StoreReleaseDateInformation | undefined {
        if (!date) {
            return undefined;
        }
        const parsedDate = this.parseReleaseDate(date, userCountry);
        if (!parsedDate) {
            return {
                isExact: false,
                date
            };
        } else {
            return {
                isExact: true,
                date: parsedDate
            };
        }
    }

    private parseReleaseDate(releaseDate: string, userCountry: Country) {
        return ['DE', 'AT', 'CH-DE'].includes(userCountry)
            ? parseDate(releaseDate, ['D.M.YYYY'])
            : parseDate(releaseDate, ['M/DD/YYYY'])
            ?? parseDate(releaseDate, ['DD/MM/YYYY'])
            ?? parseDate(releaseDate, ['D/M/YYYY'])
            ?? parseDate(releaseDate);
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
