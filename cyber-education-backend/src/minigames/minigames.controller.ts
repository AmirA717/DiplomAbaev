import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PhishingScenariosQueryDto } from './dto/phishing-scenarios-query.dto';
import { SaveMinigameResultDto } from './dto/save-minigame-result.dto';
import { MinigamesService } from './minigames.service';

@ApiTags('Minigames')
@Controller('api/minigames')
export class MinigamesController {
  constructor(private readonly minigamesService: MinigamesService) {}

  @ApiOkResponse({ description: 'Список сценариев для тренажера фишинга' })
  @Get('phishing/scenarios')
  listPhishingScenarios(@Query() query: PhishingScenariosQueryDto) {
    return this.minigamesService.listPhishingScenarios(query);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Сохранение результата мини-игры (опционально)' })
  @UseGuards(JwtAuthGuard)
  @Post('results')
  saveResult(
    @CurrentUser() user: { id: number },
    @Body() dto: SaveMinigameResultDto,
  ) {
    return this.minigamesService.saveResult(user.id, dto);
  }
}
