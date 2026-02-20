import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type TxClient = Prisma.TransactionClient;

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  async evaluateAndGrant(tx: TxClient, userId: number) {
    const achievements = await tx.achievement.findMany({
      where: { isActive: true },
    });

    const alreadyGranted = await tx.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });

    const grantedSet = new Set(
      alreadyGranted.map((item) => item.achievementId),
    );
    const grantList: number[] = [];

    for (const achievement of achievements) {
      if (grantedSet.has(achievement.id)) {
        continue;
      }

      const criteria = (achievement.criteria ?? {}) as Record<string, unknown>;
      const rawType = criteria.type;
      const rawTarget = criteria.value;
      const type = typeof rawType === 'string' ? rawType : '';
      const target =
        typeof rawTarget === 'number' ? rawTarget : Number(rawTarget ?? 0);

      const isEligible = await this.checkCriteria(tx, userId, type, target);
      if (isEligible) {
        grantList.push(achievement.id);
      }
    }

    if (grantList.length > 0) {
      await tx.userAchievement.createMany({
        data: grantList.map((achievementId) => ({ userId, achievementId })),
        skipDuplicates: true,
      });
    }
  }

  private async checkCriteria(
    tx: TxClient,
    userId: number,
    type: string,
    target: number,
  ): Promise<boolean> {
    if (type === 'quiz_count') {
      const count = await tx.quizAttempt.count({
        where: { userId, isFinished: true },
      });
      return count >= target;
    }

    if (type === 'game_count') {
      const count = await tx.gameAttempt.count({
        where: { userId, isFinished: true },
      });
      return count >= target;
    }

    if (type === 'total_points') {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { totalPoints: true },
      });
      return Number(user?.totalPoints ?? 0) >= target;
    }

    if (type === 'topic_completed') {
      const completedTopics = await tx.topicProgress.count({
        where: {
          userId,
          AND: [
            {
              topic: {
                games: { some: {} },
                quizzes: { some: {} },
              },
            },
            {
              completedGamesCount: {
                gte: 1,
              },
            },
            {
              completedQuizzesCount: {
                gte: 1,
              },
            },
          ],
        },
      });
      return completedTopics >= target;
    }

    return false;
  }
}
