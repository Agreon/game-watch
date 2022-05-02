import Puppeteer, { Page } from "puppeteer";

export const withBrowser = async <T>(
    acceptLanguage: string,
    method: (page: Page) => Promise<T>,
) => {
    const browser = await Puppeteer.launch({
        headless: true,
        args: [
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-setuid-sandbox",
            "--no-sandbox",
            `--lang=${acceptLanguage}`
        ]
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(50000);
    await page.setExtraHTTPHeaders({
        'Accept-Language': acceptLanguage
    });

    try {
        return await method(page);
    } finally {
        await page.close();
        await browser.close();
    }
};
