import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsString } from 'class-validator';

import { Tag } from './tag-model';
import { TagService } from './tag-service';

export class CreateTagDto {
  @IsString()
  public name: string;

  @IsString()
  public color: string;
}

@Controller('tag')
export class TagController {
  constructor(
    private readonly tagService: TagService
  ) { }

  @Post()
  public async create(
    @Body() { name, color }: CreateTagDto
  ): Promise<Tag> {
    return await this.tagService.create(name, color);
  }

  @Get()
  public async getAll(): Promise<Tag[]> {
    return await this.tagService.getAll();
  }
}
