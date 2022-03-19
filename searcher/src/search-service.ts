import { Logger } from "@game-watch/service";
import { InfoSourceType } from "@game-watch/shared";
import * as Sentry from '@sentry/node';
import pRetry from "p-retry";

export interface InfoSearcherContext {
    logger: Logger
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
    ) { }

    public async searchForGameInSource(
        search: string,
        type: InfoSourceType,
        context: InfoSearcherContext
    ): Promise<SearchResponse | null> {
        const logger = context.logger.child({ serviceName: SearchService.name, });

        const searcherForType = this.searchers.find(searcher => searcher.type == type);
        if (!searcherForType) {
            throw new Error(`No searcher for type ${type} found`);
        }

        const start = new Date().getTime();

        try {
            return await pRetry(
                async () => await searcherForType.search(search, { logger: logger.child({ type }) })
            );
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
