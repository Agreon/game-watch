import { Module } from '@nestjs/common';

import { ResolveService } from './resolve-service';
import { PsStoreResolver } from './resolvers/ps-store-resolver';
import { SteamResolver } from './resolvers/steam-resolver';
import { SwitchResolver } from './resolvers/switch-resolver';

@Module({
    providers: [
        ResolveService,
        SteamResolver,
        SwitchResolver,
        PsStoreResolver,
        {
            provide: "RESOLVERS",
            useFactory: (
                steamResolver, switchResolver, psStoreResolver
            ) => [steamResolver, switchResolver, psStoreResolver],
            inject: [SteamResolver, SwitchResolver, PsStoreResolver]
        }
    ],
    exports: [ResolveService]
})
export class ResolveModule { }
