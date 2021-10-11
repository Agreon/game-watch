import { Module } from '@nestjs/common';

import { ResolveService } from './resolve-service';
import { NintendoResolver } from './resolvers/nintendo-resolver';
import { PsStoreResolver } from './resolvers/ps-store-resolver';
import { SteamResolver } from './resolvers/steam-resolver';

@Module({
    providers: [
        ResolveService,
        SteamResolver,
        NintendoResolver,
        PsStoreResolver,
        {
            provide: "RESOLVERS",
            useFactory: (
                steamResolver, nintendoResolver, psStoreResolver
            ) => [steamResolver, nintendoResolver, psStoreResolver],
            inject: [SteamResolver, NintendoResolver, PsStoreResolver]
        }
    ],
    exports: [ResolveService]
})
export class ResolveModule { }
