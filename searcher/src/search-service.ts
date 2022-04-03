import { Logger } from "@game-watch/service";
import { InfoSourceType } from "@game-watch/shared";
import * as Sentry from '@sentry/node';
import { Redis } from "ioredis";
import pRetry from "p-retry";

export interface InfoSearcherContext {
    logger: Logger
}

export interface SearchServiceContext extends InfoSearcherContext {
    skipCache?: boolean
}

export interface SearchResponse {
    remoteGameId: string;
    remoteGameName: string
}

export interface InfoSearcher {
    type: InfoSourceType;
    search(name: string, context: InfoSearcherContext): Promise<SearchResponse | null>;
}

export class SearchService {
    public constructor(
        private readonly searchers: InfoSearcher[],
        private readonly redis: Redis,
    ) { }

    public async searchForGameInSource(
        search: string,
        type: InfoSourceType,
        context: SearchServiceContext
    ): Promise<SearchResponse | null> {
        const logger = context.logger.child({ serviceName: SearchService.name, });

        const searcherForType = this.searchers.find(searcher => searcher.type == type);
        if (!searcherForType) {
            throw new Error(`No searcher for type ${type} found`);
        }

        const start = new Date().getTime();

        try {
            return await pRetry(async () => {
                const existingData = await this.redis.get(search);
                if (existingData && !context.skipCache) {
                    logger.debug(`Search data for ${search} was found in cache`);

                    return JSON.parse(existingData);
                }

                const foundData = await searcherForType.search(search, { logger: logger.child({ type }) });
                await this.redis.set(search, JSON.stringify(foundData), "EX", 60 * 60 * 23);

                return foundData;
            }, {
                minTimeout: 5000,
                maxTimeout: 30000
            });

        } catch (error) {
            Sentry.captureException(error, {
                contexts: {
                    searchParameters: {
                        search,
                        type
                    }
                }
            });
            logger.child({ type }).warn(error);
            return null;
        } finally {
            const duration = new Date().getTime() - start;
            logger.debug(`Searching ${type} took ${duration} ms`);
        }
    }
}
