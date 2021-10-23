import { Module } from '@nestjs/common';

import { ResolveService } from './resolve-service';
import { EpicResolver } from './resolvers/epic-resolver';
import { MetacriticResolver } from './resolvers/metacritic-resolver';
import { PsStoreResolver } from './resolvers/ps-store-resolver';
import { SteamResolver } from './resolvers/steam-resolver';
import { SwitchResolver } from './resolvers/switch-resolver';

@Module({
    providers: [
        SteamResolver,
        SwitchResolver,
        PsStoreResolver,
        EpicResolver,
        MetacriticResolver,
        {
            provide: ResolveService,
            useFactory: (...resolvers) => new ResolveService(resolvers),
            inject: [SteamResolver, SwitchResolver, PsStoreResolver, EpicResolver, MetacriticResolver]
        }
    ],
    exports: [ResolveService]
})
export class ResolveModule { }
