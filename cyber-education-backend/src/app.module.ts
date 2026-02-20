import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TopicsModule } from './topics/topics.module';
import { GamesModule } from './games/games.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { RewardsModule } from './rewards/rewards.module';
import { StatsModule } from './stats/stats.module';
import { AdminModule } from './admin/admin.module';
import { QuestionsModule } from './questions/questions.module';
import { AttemptsModule } from './attempts/attempts.module';
import { MinigamesModule } from './minigames/minigames.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TopicsModule,
    GamesModule,
    QuizzesModule,
    RewardsModule,
    StatsModule,
    AdminModule,
    QuestionsModule,
    AttemptsModule,
    MinigamesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
