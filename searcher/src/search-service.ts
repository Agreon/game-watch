import { CacheService, Logger } from '@game-watch/service';
import { BaseGameData, Country, InfoSourceType } from '@game-watch/shared';
import axios from 'axios';

export interface InfoSearcherContext {
    logger: Logger
    userCountry: Country
}

export interface InfoSearcher {
    type: InfoSourceType
    search(name: string, context: InfoSearcherContext): Promise<BaseGameData | null>
}

export class GameNotFoundError extends Error {
    public constructor(public sourceType: InfoSourceType) { super(); }
}

export class CriticalError extends Error {
    public constructor(
        public sourceType: InfoSourceType,
        public originalError: Error
    ) { super(); }
}

export class SearchService {
    public constructor(
        private readonly searchers: InfoSearcher[],
        private readonly cacheService: CacheService,
    ) { }

    public async searchForGameInSource(
        search: string,
        type: InfoSourceType,
        context: InfoSearcherContext
    ): Promise<BaseGameData> {
        const logger = context.logger.child({
            serviceName: SearchService.name,
            type,
            search,
            context
        });

        const searcherForType = this.searchers.find(searcher => searcher.type == type);
        if (!searcherForType) {
            throw new Error(`No searcher for type ${type} found`);
        }

        const cacheKey = `${type}:${context.userCountry}:${search}`.toLocaleLowerCase();

        const existingData = await this.cacheService.get<BaseGameData>(cacheKey);
        if (existingData) {
            logger.debug(`Search data for ${cacheKey} was found in cache`);

            return existingData;
        }

        const start = new Date().getTime();

        try {
            const foundData = await searcherForType.search(search, { ...context, logger });
            if (!foundData) {
                throw new GameNotFoundError(type);
            }

            await this.cacheService.set(cacheKey, foundData);

            return foundData;
        } catch (error) {
            if (!(error instanceof GameNotFoundError)) {
                logger.warn(error, `Error thrown while searching ${type} for ${search}`);
            }

            if (
                error instanceof GameNotFoundError
                // We only want to retry on network errors that are not signaling us to stop.
                || (axios.isAxiosError(error) && error.response?.status !== 403)
                // This error occurs if Puppeteer timeouts.
                || error.name === 'TimeoutError'
            ) {
                throw error;
            }

            logger.warn("Retrying likely won't help. Aborting immediately");
            throw new CriticalError(type, error);
        } finally {
            const duration = new Date().getTime() - start;
            logger.debug(`Searching ${type} took ${duration} ms`);
        }
    }
}
