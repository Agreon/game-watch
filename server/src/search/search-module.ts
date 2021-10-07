import { Module } from '@nestjs/common';
import { SearchService } from './search-service';
import { NintendoSearcher } from './searchers/nintendo-searcher';
import { PsStoreSearcher } from './searchers/ps-store-searcher';
import { SteamSearcher } from './searchers/steam-searcher';

@Module({
    providers: [
        SearchService,
        SteamSearcher,
        NintendoSearcher,
        PsStoreSearcher,
        {
            provide: "SEARCHERS",
            useFactory: (
                steamSearcher, nintendoSearcher, psStoreSearcher
            ) => [steamSearcher, nintendoSearcher, psStoreSearcher],
            inject: [SteamSearcher, NintendoSearcher, PsStoreSearcher]
        }
    ],
    exports: [SearchService]
})
export class SearchModule { }
