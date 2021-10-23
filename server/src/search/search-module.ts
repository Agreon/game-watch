import { Module } from '@nestjs/common';

import { SearchService } from './search-service';
import { EpicSearcher } from './searchers/epic-searcher';
import { MetacriticSearcher } from './searchers/metacritic-searcher';
import { PsStoreSearcher } from './searchers/ps-store-searcher';
import { SteamSearcher } from './searchers/steam-searcher';
import { SwitchSearcher } from './searchers/switch-searcher';

@Module({
    providers: [
        SteamSearcher,
        SwitchSearcher,
        PsStoreSearcher,
        EpicSearcher,
        MetacriticSearcher,
        {
            provide: SearchService,
            useFactory: (...searchers) => new SearchService(searchers),
            inject: [SteamSearcher, SwitchSearcher, PsStoreSearcher, EpicSearcher, MetacriticSearcher]
        }
    ],
    exports: [SearchService]
})
export class SearchModule { }
