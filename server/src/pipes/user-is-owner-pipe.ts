import { Game, User } from "@game-watch/database";
import { EntityManager, IdentifiedReference } from "@mikro-orm/core";
import { ArgumentMetadata, ForbiddenException, forwardRef, Inject, Injectable, Scope, UnauthorizedException } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";

@Injectable({ scope: Scope.REQUEST })
export class UserIsOwner {
    public constructor(
        @Inject(forwardRef(() => EntityManager))
        private readonly entityManager: EntityManager,
        @Inject(REQUEST) private request: Request,
    ) { }

    public async transform(id: string, { metatype }: ArgumentMetadata): Promise<Game> {
        if (!metatype) {
            throw new Error("No metatype found",);
        }
        const user = this.request.user as IdentifiedReference<User>;
        if (!user) {
            throw new UnauthorizedException();
        }

        const entity = await this.entityManager.findOne(metatype, { id, user });
        if (!entity) {
            throw new ForbiddenException();
        }

        return entity;
    }
}
