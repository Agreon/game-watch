import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateTagDto, TagDto } from 'game-watch-shared';

import { TagService } from './tag-service';

@Controller('tag')
export class TagController {
  constructor(
    private readonly tagService: TagService
  ) { }

  @Post()
  public async create(
    @Body() { name, color }: CreateTagDto
  ): Promise<TagDto> {
    return await this.tagService.create(name, color);
  }

  @Get()
  public async getAll(): Promise<TagDto[]> {
    return await this.tagService.getAll();
  }
}
