import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttemptsService {
  constructor(private readonly prisma: PrismaService) {}

  getMyQuizAttempts(userId: number) {
    return this.prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: {
        quiz: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  getMyGameAttempts(userId: number) {
    return this.prisma.gameAttempt.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    });
  }
}
