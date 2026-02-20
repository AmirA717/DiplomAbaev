import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyStats(userId: number) {
    const [user, completedQuizzes, completedGames, topicProgresses] =
      await this.prisma.$transaction([
        this.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, totalPoints: true },
        }),
        this.prisma.quizAttempt.count({
          where: { userId, isFinished: true },
        }),
        this.prisma.gameAttempt.count({
          where: { userId, isFinished: true },
        }),
        this.prisma.topicProgress.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
          include: {
            topic: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        }),
      ]);

    const correctAnswersAggregate = await this.prisma.quizAttempt.aggregate({
      where: { userId, isFinished: true },
      _sum: { score: true, maxScore: true },
    });

    const completedTopics = topicProgresses.filter(
      (item) => item.completedGamesCount > 0 && item.completedQuizzesCount > 0,
    ).length;

    return {
      userId: user?.id ?? userId,
      totalPoints: Number(user?.totalPoints ?? 0),
      completedQuizzes,
      completedGames,
      completedTopics,
      scoreSummary: {
        earned: correctAnswersAggregate._sum.score ?? 0,
        possible: correctAnswersAggregate._sum.maxScore ?? 0,
      },
      topicProgresses,
    };
  }
}
