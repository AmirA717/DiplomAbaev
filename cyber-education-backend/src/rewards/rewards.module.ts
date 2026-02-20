import { Module } from '@nestjs/common';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { AchievementsService } from './achievements.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RewardsController],
  providers: [RewardsService, AchievementsService],
  exports: [AchievementsService, RewardsService],
})
export class RewardsModule {}
