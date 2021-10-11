import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { InfoSource } from "../info-source/info-source-model";
import { ResolveModule } from '../resolve/resolve-module';
import { SearchModule } from '../search/search-module';
import { GameController } from './game-controller';
import { Game } from './game-model';
import { GameService } from './game-service';

@Module({
    imports: [
        MikroOrmModule.forFeature([Game, InfoSource]),
        SearchModule,
        ResolveModule
    ],
    providers: [
        GameService
    ],
    controllers: [
        GameController
    ]
})
export class GameModule { }
