import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsString } from 'class-validator';

import { UserService } from '../auth/user-service';
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
    private readonly tagService: TagService,
    private readonly userService: UserService
  ) { }

  @Post()
  public async create(
    @Body() { name, color }: CreateTagDto
  ): Promise<Tag> {
    const user = await this.userService.getUserOrFail("");
    return await this.tagService.create(name, color, user);
  }

  @Get()
  public async getAll(): Promise<Tag[]> {
    return await this.tagService.getAll();
  }
}
