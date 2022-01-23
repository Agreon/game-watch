import { User } from "@game-watch/database";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { UserService } from "./user-service";

@Module({
    imports: [
        MikroOrmModule.forFeature([User]),
    ],
    providers: [
        UserService
    ],
    controllers: [

    ],
    exports: [UserService]
})
export class AuthModule { }
