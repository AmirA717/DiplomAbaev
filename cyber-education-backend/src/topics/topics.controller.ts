import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TopicsService } from './topics.service';
import { TopicsQueryDto } from './dto/topics-query.dto';

@ApiTags('Topics')
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @ApiOkResponse({ description: 'Список опубликованных тем' })
  @Get()
  listTopics(@Query() query: TopicsQueryDto) {
    return this.topicsService.listTopics(query);
  }

  @ApiOkResponse({ description: 'Детали темы' })
  @Get(':id')
  getTopicById(@Param('id', ParseIntPipe) id: number) {
    return this.topicsService.getTopicById(id);
  }

  @ApiOkResponse({ description: 'Материалы по теме' })
  @Get(':id/materials')
  getTopicMaterials(@Param('id', ParseIntPipe) id: number) {
    return this.topicsService.getTopicMaterials(id);
  }
}
