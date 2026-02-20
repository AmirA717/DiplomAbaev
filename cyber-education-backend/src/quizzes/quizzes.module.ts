import { Module } from '@nestjs/common';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ScoringService } from './scoring.service';
import { RewardsModule } from '../rewards/rewards.module';

@Module({
  imports: [PrismaModule, RewardsModule],
  controllers: [QuizzesController],
  providers: [QuizzesService, ScoringService],
  exports: [QuizzesService, ScoringService],
})
export class QuizzesModule {}
