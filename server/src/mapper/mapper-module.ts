import { Module } from '@nestjs/common';

import { MapperService } from './mapper-service';
import { EpicMapper } from './mappers/epic-mapper';
import { MetacriticMapper } from './mappers/metacritic-mapper';
import { PlaystationMapper } from './mappers/playstation-mapper';
import { SteamMapper } from './mappers/steam-mapper';
import { SwitchMapper } from './mappers/switch-mapper';
import { XboxMapper } from './mappers/xbox-mapper';

@Module({
    providers: [
        SteamMapper,
        SwitchMapper,
        PlaystationMapper,
        XboxMapper,
        EpicMapper,
        MetacriticMapper,
        {
            provide: MapperService,
            useFactory: (...mappers) => new MapperService(mappers),
            inject: [SteamMapper, SwitchMapper, PlaystationMapper, XboxMapper, EpicMapper, MetacriticMapper]
        }
    ],
    exports: [MapperService]
})
export class MapperModule { }
