import { User } from '@game-watch/database';
import { CreateTagDto, TagDto } from '@game-watch/shared';
import { Ref } from '@mikro-orm/core';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user-decorator';
import { JwtAccessTokenGuard } from '../auth/jwt-access-token-guard';
import { TagService } from './tag-service';

@UseGuards(JwtAccessTokenGuard)
@Controller('tag')
export class TagController {
  constructor(
    private readonly tagService: TagService,
  ) { }

  @Post()
  public async create(
    @Body() { name, color }: CreateTagDto,
    @CurrentUser() user: Ref<User>
  ): Promise<TagDto> {
    return await this.tagService.create(name, color, user);
  }

  @Get()
  public async getAll(
    @CurrentUser() user: Ref<User>,
  ): Promise<TagDto[]> {
    return await this.tagService.getAll(user);
  }
}
