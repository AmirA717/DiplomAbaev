import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AttemptsService } from './attempts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Attempts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @ApiOkResponse({ description: 'Мои попытки викторин' })
  @Get('quizzes/me')
  getMyQuizAttempts(@CurrentUser() user: { id: number }) {
    return this.attemptsService.getMyQuizAttempts(user.id);
  }

  @ApiOkResponse({ description: 'Мои попытки мини-игр' })
  @Get('games/me')
  getMyGameAttempts(@CurrentUser() user: { id: number }) {
    return this.attemptsService.getMyGameAttempts(user.id);
  }
}
