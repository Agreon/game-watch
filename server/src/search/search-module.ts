import { Module } from '@nestjs/common';

import { SearchService } from './search-service';
import { MetacriticSearcher } from './searchers/metacritic-searcher';
import { PsStoreSearcher } from './searchers/ps-store-searcher';
import { SteamSearcher } from './searchers/steam-searcher';
import { SwitchSearcher } from './searchers/switch-searcher';

@Module({
    providers: [
        SearchService,
        SteamSearcher,
        SwitchSearcher,
        PsStoreSearcher,
        MetacriticSearcher,
        {
            provide: "SEARCHERS",
            useFactory: (
                steamSearcher, switchSearcher, psStoreSearcher, metacriticSearcher
            ) => [steamSearcher, switchSearcher, psStoreSearcher, metacriticSearcher],
            inject: [SteamSearcher, SwitchSearcher, PsStoreSearcher, MetacriticSearcher]
        }
    ],
    exports: [SearchService]
})
export class SearchModule { }
