import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { QuizzesQueryDto } from './dto/quizzes-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Body } from '@nestjs/common';
import { AnswerAttemptDto } from './dto/answer-attempt.dto';
import { UserRole } from '@prisma/client';

@ApiTags('Quizzes')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @ApiOkResponse({ description: 'Список опубликованных викторин' })
  @Get()
  list(@Query() query: QuizzesQueryDto) {
    return this.quizzesService.list(query);
  }

  @ApiOkResponse({ description: 'Детали викторины' })
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.quizzesService.getById(id);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Вопросы викторины' })
  @UseGuards(JwtAuthGuard)
  @Get(':id/questions')
  getQuestions(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { role: UserRole },
  ) {
    return this.quizzesService.getQuestions(id, user.role);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Старт попытки викторины' })
  @UseGuards(JwtAuthGuard)
  @Post(':id/attempts')
  startAttempt(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.quizzesService.startAttempt(id, user.id);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Ответ в попытке викторины' })
  @UseGuards(JwtAuthGuard)
  @Post('attempts/:attemptId/answer')
  answerAttempt(
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @CurrentUser() user: { id: number },
    @Body() dto: AnswerAttemptDto,
  ) {
    return this.quizzesService.answerAttempt(attemptId, user.id, dto);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Сабмит викторины и подсчет баллов' })
  @UseGuards(JwtAuthGuard)
  @Post('attempts/:attemptId/submit')
  submitAttempt(
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.quizzesService.submitAttempt(attemptId, user.id);
  }
}
