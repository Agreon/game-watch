import { Inject, Injectable, Logger } from "@nestjs/common";
import * as Sentry from '@sentry/node';

import { InfoSourceType } from "../info-source/info-source-model";

export interface InfoSearcher {
    type: InfoSourceType;
    search(name: string): Promise<string | null>;
}

@Injectable()
export class SearchService {
    private readonly logger = new Logger(SearchService.name);

    public constructor(
        @Inject("SEARCHERS")
        private readonly searchers: InfoSearcher[],
    ) { }

    public async searchForGameInSource(search: string, type: InfoSourceType): Promise<string | null> {
        const searcherForType = this.searchers.find(searcher => searcher.type == type);
        if (!searcherForType) {
            throw new Error(`No searcher for type ${type} found`);
        }

        this.logger.debug(`Searching ${type} for '${search}'`);
        const start = new Date().getTime();

        try {
            return await searcherForType.search(search);
        } catch (error) {
            Sentry.captureException(error, {
                contexts: {
                    searchParameters: {
                        search,
                        type
                    }
                }
            });
            this.logger.warn(`[${type}]: ${error}`);
            return null;
        } finally {
            const duration = new Date().getTime() - start;
            this.logger.debug(`Searching ${type} took ${duration} ms`);
        }
    }
}