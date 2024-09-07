import { Module } from '@nestjs/common';

import { MapperService } from './mapper-service';
import { EpicMapper } from './mappers/epic-mapper';
import { MetacriticMapper } from './mappers/metacritic-mapper';
import { OpenCriticMapper } from './mappers/opencritic-mapper';
import { PlaystationMapper } from './mappers/playstation-mapper';
import { ProtonMapper } from './mappers/proton-mapper';
import { SteamMapper } from './mappers/steam-mapper';
import { SwitchMapper } from './mappers/switch-mapper';
import { XboxMapper } from './mappers/xbox-mapper';

const MAPPERS = [
    SteamMapper,
    SwitchMapper,
    PlaystationMapper,
    XboxMapper,
    EpicMapper,
    MetacriticMapper,
    OpenCriticMapper,
    ProtonMapper,
];

@Module({
    providers: [
        ...MAPPERS,
        {
            provide: MapperService,
            useFactory: (...mappers) => new MapperService(mappers),
            inject: MAPPERS
        }
    ],
    exports: [MapperService]
})
export class MapperModule { }
