import { Module } from '@nestjs/common';

import { MapperService } from './mapper-service';
import { EpicResolver } from './mappers/epic-mapper';
import { MetacriticMapper } from './mappers/metacritic-mapper';
import { PsStoreMapper } from './mappers/ps-store-mapper';
import { SteamMapper } from './mappers/steam-mapper';
import { SwitchMapper } from './mappers/switch-mapper';

@Module({
    providers: [
        SteamMapper,
        SwitchMapper,
        PsStoreMapper,
        EpicResolver,
        MetacriticMapper,
        {
            provide: MapperService,
            useFactory: (...mappers) => new MapperService(mappers),
            inject: [SteamMapper, SwitchMapper, PsStoreMapper, EpicResolver, MetacriticMapper]
        }
    ],
    exports: [MapperService]
})
export class MapperModule { }
