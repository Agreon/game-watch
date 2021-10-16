import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsString } from 'class-validator';

import { Tag } from './tag-model';
import { TagService } from './tag-service';

export class CreateTagDto {
  @IsString()
  public name: string;
}

@Controller('tag')
export class TagController {
  constructor(
    private readonly tagService: TagService
  ) { }

  @Post()
  public async create(
    @Body() { name }: CreateTagDto
  ): Promise<Tag> {
    return await this.tagService.create(name);
  }

  @Get()
  public async getAll(): Promise<Tag[]> {
    return await this.tagService.getAll();
  }
}
