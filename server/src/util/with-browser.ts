import Puppeteer, { Page } from "puppeteer";

export const withBrowser = async <T>(method: (page: Page) => Promise<T>) => {
    // TODO: Set user language https://stackoverflow.com/a/47292022
    const browser = await Puppeteer.launch({})
    const page = await browser.newPage();

    try {
        return await method(page);
    } finally {
        await browser.close();
    }
}
