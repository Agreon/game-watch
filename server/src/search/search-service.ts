import { Inject, Injectable, Logger } from "@nestjs/common";
import { InfoSourceType } from "../game/info-source-model";

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

    public async searchForGameInSource(name: string, type: InfoSourceType): Promise<string | null> {
        const searcherForType = this.searchers.find(searcher => searcher.type == type);
        if (!searcherForType) {
            throw new Error(`No searcher for type ${type} found`);
        }

        try {
            return await searcherForType.search(name);
        } catch (error) {
            // TODO: Or show user Something unexpected went wrong
            this.logger.warn(error);
            return null;
        }
    }
}