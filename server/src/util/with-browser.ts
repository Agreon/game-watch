import Puppeteer, { Page } from "puppeteer";

export const withBrowser = async <T>(method: (page: Page) => Promise<T>) => {
    // TODO: Set user language https://stackoverflow.com/a/47292022
    const browser = await Puppeteer.launch({
        headless: true,
        args: [
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-setuid-sandbox",
            "--no-sandbox",
        ]
    })
    const page = await browser.newPage();
    await page.setDefaultTimeout(60000);

    try {
        return await method(page);
    } finally {
        await browser.close();
    }
}
