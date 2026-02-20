import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GamesService } from './games.service';
import { GamesQueryDto } from './dto/games-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FinishGameAttemptDto } from './dto/finish-game-attempt.dto';

@ApiTags('Games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @ApiOkResponse({ description: 'Список опубликованных игр' })
  @Get()
  list(@Query() query: GamesQueryDto) {
    return this.gamesService.list(query);
  }

  @ApiOkResponse({ description: 'Детали игры' })
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.getById(id);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Старт попытки игры' })
  @UseGuards(JwtAuthGuard)
  @Post(':id/attempts')
  startAttempt(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.gamesService.startAttempt(id, user.id);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Завершение попытки игры' })
  @UseGuards(JwtAuthGuard)
  @Patch('attempts/:attemptId/finish')
  finishAttempt(
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @CurrentUser() user: { id: number },
    @Body() dto: FinishGameAttemptDto,
  ) {
    return this.gamesService.finishAttempt(attemptId, user.id, dto);
  }
}
