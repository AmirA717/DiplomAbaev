import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RewardsService {
  constructor(private readonly prisma: PrismaService) {}

  listRewards() {
    return this.prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        code: true,
        title: true,
        name: true,
        description: true,
        icon: true,
      },
    });
  }

  getMyAchievements(userId: number) {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
      include: {
        achievement: {
          select: {
            id: true,
            code: true,
            title: true,
            name: true,
            description: true,
            icon: true,
          },
        },
      },
    });
  }
}
