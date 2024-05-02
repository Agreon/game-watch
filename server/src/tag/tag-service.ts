import { Tag, User } from '@game-watch/database';
import { QueryOrder, Ref } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { ConflictException, Injectable } from '@nestjs/common';

@Injectable()
export class TagService {
  public constructor(
    private readonly entityManager: EntityManager,
  ) { }

  public async create(name: string, color: string, user: Ref<User>) {
    let tag = await this.entityManager.findOne(Tag, { name, user });
    if (tag !== null) {
      throw new ConflictException();
    }

    tag = new Tag({ name, color, user });
    await this.entityManager.persistAndFlush(tag);

    return tag;
  }

  public async getAll(user: Ref<User>) {
    return await this.entityManager.createQueryBuilder(Tag, 'tag')
      .select('*')
      .where({ user })
      .orderBy({
        createdAt: QueryOrder.DESC,
      })
      .getResult();
  }
}
