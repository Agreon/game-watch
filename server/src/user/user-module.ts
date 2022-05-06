import { User } from "@game-watch/database";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { UserController } from "./user-controller";
import { UserService } from "./user-service";

@Module({
    imports: [MikroOrmModule.forFeature([User])],
    providers: [UserService],
    controllers: [UserController]
})
export class UserModule { }
