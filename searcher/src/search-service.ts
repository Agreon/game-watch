import { Logger } from "@game-watch/service";
import { Country, InfoSourceType } from "@game-watch/shared";
import * as Sentry from '@sentry/node';
import axios from "axios";
import { Redis } from "ioredis";
import pRetry from "p-retry";

export interface InfoSearcherContext {
    logger: Logger
    userCountry: Country
}

export interface SearchServiceContext extends InfoSearcherContext {
    initialRun?: boolean
}

export interface SearchResponse {
    remoteGameId: string
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
        const logger = context.logger.child({ serviceName: SearchService.name, type, search });

        const searcherForType = this.searchers.find(searcher => searcher.type == type);
        if (!searcherForType) {
            throw new Error(`No searcher for type ${type} found`);
        }

        const start = new Date().getTime();
        const cacheKey = `${type}:${context.userCountry}:${search}`;

        try {
            return await pRetry(async () => {
                const existingData = await this.redis.get(cacheKey);
                if (existingData) {
                    logger.debug(`Search data for ${cacheKey} was found in cache`);

                    return JSON.parse(existingData);
                }

                const foundData = await searcherForType.search(search, { ...context, logger });
                await this.redis.set(cacheKey, JSON.stringify(foundData), "EX", 60 * 60 * 23);

                return foundData;
            }, {
                minTimeout: 5000,
                maxTimeout: 30000,
                // If the user is actively waiting don't retry to often
                retries: context.initialRun ? 2 : 5,
                onFailedAttempt: error => {
                    logger.warn(error, `Error thrown while searching ${type} for ${search}`);
                    // We only want to retry on network errors that are not signaling us to stop anyway.
                    if(axios.isAxiosError(error) && error.response?.status !== 403) {
                        return;
                    }
                    logger.warn("Retrying likely won't help. Aborting immediately");
                }
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
            logger.error(error);
            return null;
        } finally {
            const duration = new Date().getTime() - start;
            logger.debug(`Searching ${type} took ${duration} ms`);
        }
    }
}
