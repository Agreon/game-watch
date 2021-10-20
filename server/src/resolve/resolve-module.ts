import { Module } from '@nestjs/common';

import { ResolveService } from './resolve-service';
import { MetacriticResolver } from './resolvers/metacritic-resolver';
import { PsStoreResolver } from './resolvers/ps-store-resolver';
import { SteamResolver } from './resolvers/steam-resolver';
import { SwitchResolver } from './resolvers/switch-resolver';

@Module({
    providers: [
        ResolveService,
        SteamResolver,
        SwitchResolver,
        PsStoreResolver,
        MetacriticResolver,
        {
            provide: "RESOLVERS",
            useFactory: (
                steamResolver, switchResolver, psStoreResolver, metacriticResolver
            ) => [steamResolver, switchResolver, psStoreResolver, metacriticResolver],
            inject: [SteamResolver, SwitchResolver, PsStoreResolver, MetacriticResolver]
        }
    ],
    exports: [ResolveService]
})
export class ResolveModule { }
