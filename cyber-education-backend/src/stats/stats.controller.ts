import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Stats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @ApiOkResponse({ description: 'Статистика текущего пользователя' })
  @Get('stats')
  getMyStats(@CurrentUser() user: { id: number }) {
    return this.statsService.getMyStats(user.id);
  }
}
