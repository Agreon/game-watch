import { Module } from '@nestjs/common';

import { SearchService } from './search-service';
import { SwitchSearcher } from './searchers/switch-searcher';
import { PsStoreSearcher } from './searchers/ps-store-searcher';
import { SteamSearcher } from './searchers/steam-searcher';

@Module({
    providers: [
        SearchService,
        SteamSearcher,
        SwitchSearcher,
        PsStoreSearcher,
        {
            provide: "SEARCHERS",
            useFactory: (
                steamSearcher, switchSearcher, psStoreSearcher
            ) => [steamSearcher, switchSearcher, psStoreSearcher],
            inject: [SteamSearcher, SwitchSearcher, PsStoreSearcher]
        }
    ],
    exports: [SearchService]
})
export class SearchModule { }
