import { QueryOrder } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/knex';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ConflictException, Injectable } from '@nestjs/common';

import { Tag } from './tag-model';


@Injectable()
export class TagService {
  public constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: EntityRepository<Tag>
  ) { }

  public async create(name: string, color: string) {
    let tag = await this.tagRepository.findOne({ name });
    if (tag !== null) {
      throw new ConflictException();
    }

    tag = new Tag({ name, color });
    await this.tagRepository.persistAndFlush(tag);

    return tag;
  }

  public async getAll() {
    return await this.tagRepository.findAll({
      orderBy: {
        createdAt: QueryOrder.DESC,
      }
    });
  }

}
