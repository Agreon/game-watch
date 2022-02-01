import { Tag, User } from '@game-watch/database';
import { IdentifiedReference, QueryOrder } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/knex';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ConflictException, Injectable } from '@nestjs/common';

@Injectable()
export class TagService {
  public constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: EntityRepository<Tag>
  ) { }

  public async create(name: string, color: string, user: IdentifiedReference<User>) {
    let tag = await this.tagRepository.findOne({ name, user });
    if (tag !== null) {
      throw new ConflictException();
    }

    tag = new Tag({ name, color, user });
    await this.tagRepository.persistAndFlush(tag);

    return tag;
  }

  public async getAll(user: IdentifiedReference<User>) {
    return await this.tagRepository.createQueryBuilder("tag")
      .select("*")
      .where({ user })
      .orderBy({
        createdAt: QueryOrder.DESC,
      })
      .getResult();
  }
}
