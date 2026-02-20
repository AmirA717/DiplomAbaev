import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { TopicsService } from './topics.service';

class MaterialsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  topicId?: number;
}

@ApiTags('Materials')
@Controller('materials')
export class MaterialsController {
  constructor(private readonly topicsService: TopicsService) {}

  @ApiOkResponse({ description: 'Публичный список материалов' })
  @Get()
  list(@Query() query: MaterialsQueryDto) {
    return this.topicsService.listMaterials(query.topicId);
  }
}
