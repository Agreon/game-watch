import { Module } from '@nestjs/common';

import { MapperService } from './mapper-service';
import { EpicResolver } from './mappers/epic-mapper';
import { MetacriticMapper } from './mappers/metacritic-mapper';
import { PlaystationMapper } from './mappers/playstation-mapper';
import { SteamMapper } from './mappers/steam-mapper';
import { SwitchMapper } from './mappers/switch-mapper';

@Module({
    providers: [
        SteamMapper,
        SwitchMapper,
        PlaystationMapper,
        EpicResolver,
        MetacriticMapper,
        {
            provide: MapperService,
            useFactory: (...mappers) => new MapperService(mappers),
            inject: [SteamMapper, SwitchMapper, PlaystationMapper, EpicResolver, MetacriticMapper]
        }
    ],
    exports: [MapperService]
})
export class MapperModule { }
