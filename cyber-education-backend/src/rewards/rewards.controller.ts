import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RewardsService } from './rewards.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Rewards')
@Controller()
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @ApiOkResponse({ description: 'Список доступных достижений' })
  @Get('rewards')
  listRewards() {
    return this.rewardsService.listRewards();
  }

  @ApiTags('Users')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Достижения текущего пользователя' })
  @UseGuards(JwtAuthGuard)
  @Get('users/me/achievements')
  getMyAchievements(@CurrentUser() user: { id: number }) {
    return this.rewardsService.getMyAchievements(user.id);
  }
}
